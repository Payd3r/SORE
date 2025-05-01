import fs from 'fs';
import path from 'path';
import { processImageJob } from '../services/imageWorker';
import os from 'os';

const QUEUE_DIR = path.join(__dirname, '../../queue');
const PROCESSING_DIR = path.join(QUEUE_DIR, 'processing');
const COMPLETED_DIR = path.join(QUEUE_DIR, 'completed');
const FAILED_DIR = path.join(QUEUE_DIR, 'failed');

// Numero massimo di job da processare in parallelo (default: numero di CPU - 1)
const MAX_CONCURRENT_JOBS = Math.max(1, os.cpus().length - 1);

// Tempo di conservazione dei job completati (24 ore)
const COMPLETED_JOB_RETENTION = 24 * 60 * 60 * 1000;

// Crea le directory necessarie
[QUEUE_DIR, PROCESSING_DIR, COMPLETED_DIR, FAILED_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

interface QueueJob {
  id: string;
  data: any;
  timestamp: number;
  progress?: number;
  status?: string;
}

class FileSystemQueue {
  private static instance: FileSystemQueue;
  private processing: boolean = false;
  private activeJobs: Set<string> = new Set();

  private constructor() {
    this.startProcessing();
    this.startCleanup();
    //console.log(`[Queue] Initialized with maximum ${MAX_CONCURRENT_JOBS} concurrent jobs`);
  }

  public static getInstance(): FileSystemQueue {
    if (!FileSystemQueue.instance) {
      FileSystemQueue.instance = new FileSystemQueue();
    }
    return FileSystemQueue.instance;
  }

  private async startCleanup() {
    setInterval(() => {
      this.cleanupCompletedJobs();
    }, 60 * 60 * 1000); // Esegui la pulizia ogni ora
  }

  private cleanupCompletedJobs() {
    try {
      const files = fs.readdirSync(COMPLETED_DIR);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(COMPLETED_DIR, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;

        if (age > COMPLETED_JOB_RETENTION) {
          fs.unlinkSync(filePath);
          //console.log(`[Queue] Cleaned up old completed job: ${file}`);
        }
      }
    } catch (error) {
      console.error('[Queue] Error cleaning up completed jobs:', error);
    }
  }

  private async startProcessing() {
    if (this.processing) return;
    this.processing = true;

    while (this.processing) {
      try {
        const files = fs.readdirSync(PROCESSING_DIR);
        const pendingJobs = files.filter(file => !this.activeJobs.has(file));
        
        // Se abbiamo spazio per più job e ci sono job in attesa
        if (this.activeJobs.size < MAX_CONCURRENT_JOBS && pendingJobs.length > 0) {
          // Prendi i prossimi job fino al raggiungimento del limite di concorrenza
          const jobsToProcess = pendingJobs.slice(0, MAX_CONCURRENT_JOBS - this.activeJobs.size);
          
          for (const file of jobsToProcess) {
            const filePath = path.join(PROCESSING_DIR, file);
            const jobData = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as QueueJob;
            
            // Segna il job come attivo
            this.activeJobs.add(file);
            
            // Processa il job in modo asincrono
            this.processJob(file, jobData).finally(() => {
              // Rimuovi il job dalla lista dei job attivi quando è completato
              this.activeJobs.delete(file);
            });
          }
        }
      } catch (error) {
        console.error('[Queue] Error in queue processing:', error);
      }

      // Aspetta 500ms prima di controllare di nuovo
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  private async processJob(file: string, jobData: QueueJob): Promise<void> {
    const filePath = path.join(PROCESSING_DIR, file);
    
    try {
      //console.log(`[Queue] Processing job ${jobData.id}`);
      
      // Aggiungi l'ID del job ai dati
      jobData.data.id = jobData.id;
      
      await processImageJob(jobData.data);
      
      // Aggiorna il job con lo stato finale
      jobData.progress = 100;
      jobData.status = 'Completato';
      
      // Sposta il file nella directory completed
      fs.writeFileSync(path.join(COMPLETED_DIR, file), JSON.stringify(jobData));
      fs.unlinkSync(filePath);
      //console.log(`[Queue] Job ${jobData.id} completed successfully`);
    } catch (error) {
      console.error(`[Queue] Error processing job ${jobData.id}:`, error);
      // Aggiorna il job con lo stato di errore
      jobData.progress = 0;
      jobData.status = error instanceof Error ? error.message : 'Errore sconosciuto';
      // Sposta il file nella directory failed
      fs.writeFileSync(path.join(FAILED_DIR, file), JSON.stringify(jobData));
      fs.unlinkSync(filePath);
    }
  }

  public async add(data: any): Promise<QueueJob> {
    const job: QueueJob = {
      id: Math.random().toString(36).substring(7),
      data,
      timestamp: Date.now(),
      progress: 0,
      status: 'In coda'
    };

    const fileName = `${job.id}.json`;
    const filePath = path.join(PROCESSING_DIR, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(job));  

    return job;
  }

  public async getJob(jobId: string): Promise<QueueJob | null> {
    // Cerca il job in tutte le directory
    const directories = [PROCESSING_DIR, COMPLETED_DIR, FAILED_DIR];
    
    for (const dir of directories) {
      const files = fs.readdirSync(dir);
      const file = files.find(f => f.startsWith(jobId));
      
      if (file) {
        const filePath = path.join(dir, file);
        //console.log(`[GetJob] Found job ${jobId} in directory ${dir}`);
        const jobData = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as QueueJob;        
        return jobData;
      }
    }

    //console.log(`[GetJob] Job ${jobId} not found in any directory`);
    return null;
  }

  public async getJobState(jobId: string): Promise<{ state: string; progress?: number; status?: string }> {

    const job = await this.getJob(jobId);
    if (!job) {
      return { state: 'notfound' };
    }

    //console.log(`[JobState] Found job ${jobId} with current progress: ${job.progress}%, status: "${job.status}"`);

    // Se il job è in processing, restituisci il progresso corrente
    if (fs.existsSync(path.join(PROCESSING_DIR, `${jobId}.json`))) {
      //console.log(`[JobState] Job ${jobId} is in processing directory`);
      const state = { 
        state: 'processing',
        progress: job.progress || 0,
        status: job.status || 'In elaborazione'
      };
      //console.log(`[JobState] Returning state:`, state);
      return state;
    }

    // Se il job è completato
    if (fs.existsSync(path.join(COMPLETED_DIR, `${jobId}.json`))) {
      //console.log(`[JobState] Job ${jobId} is in completed directory`);
      const state = { state: 'completed', progress: 100, status: 'Completato' };
      //console.log(`[JobState] Returning state:`, state);
      return state;
    }

    // Se il job è fallito
    if (fs.existsSync(path.join(FAILED_DIR, `${jobId}.json`))) {
      //console.log(`[JobState] Job ${jobId} is in failed directory`);
      const state = { state: 'failed', progress: 0, status: job.status || 'Fallito' };
      //console.log(`[JobState] Returning state:`, state);
      return state;
    }

    //console.log(`[JobState] Job ${jobId} not found in any directory`);
    return { state: 'notfound' };
  }

  public async updateJob(job: QueueJob): Promise<void> {
    const directories = [PROCESSING_DIR, COMPLETED_DIR, FAILED_DIR];
    
    for (const dir of directories) {
      const files = fs.readdirSync(dir);
      const file = files.find(f => f.startsWith(job.id));
      
      if (file) {
        const filePath = path.join(dir, file);
        fs.writeFileSync(filePath, JSON.stringify(job));
        //console.log(`[Queue] Updated job ${job.id} with progress ${job.progress}% and status "${job.status}"`);
        return;
      }
    }
    console.warn(`[Queue] Could not find job ${job.id} to update`);
  }

  public getActiveJobsCount(): number {
    return this.activeJobs.size;
  }

  public getMaxConcurrentJobs(): number {
    return MAX_CONCURRENT_JOBS;
  }

  public stop() {
    this.processing = false;
  }
}

export default FileSystemQueue.getInstance(); 