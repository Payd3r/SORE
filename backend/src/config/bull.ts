import fs from 'fs';
import path from 'path';
import { processImageJob } from '../services/imageWorker';

const QUEUE_DIR = path.join(__dirname, '../../queue');
const PROCESSING_DIR = path.join(QUEUE_DIR, 'processing');
const COMPLETED_DIR = path.join(QUEUE_DIR, 'completed');
const FAILED_DIR = path.join(QUEUE_DIR, 'failed');

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
}

class FileSystemQueue {
  private static instance: FileSystemQueue;
  private processing: boolean = false;

  private constructor() {
    this.startProcessing();
  }

  public static getInstance(): FileSystemQueue {
    if (!FileSystemQueue.instance) {
      FileSystemQueue.instance = new FileSystemQueue();
    }
    return FileSystemQueue.instance;
  }

  private async startProcessing() {
    if (this.processing) return;
    this.processing = true;

    while (this.processing) {
      try {
        const files = fs.readdirSync(PROCESSING_DIR);
        
        for (const file of files) {
          const filePath = path.join(PROCESSING_DIR, file);
          const jobData = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as QueueJob;
          
          try {
            await processImageJob(jobData.data);
            // Sposta il file nella directory completed
            fs.renameSync(filePath, path.join(COMPLETED_DIR, file));
            console.log(`[Queue] Job ${jobData.id} completed successfully`);
          } catch (error) {
            console.error(`[Queue] Error processing job ${jobData.id}:`, error);
            // Sposta il file nella directory failed
            fs.renameSync(filePath, path.join(FAILED_DIR, file));
          }
        }
      } catch (error) {
        console.error('[Queue] Error in queue processing:', error);
      }

      // Aspetta 1 secondo prima di controllare di nuovo
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  public async add(data: any): Promise<QueueJob> {
    const job: QueueJob = {
      id: Math.random().toString(36).substring(7),
      data,
      timestamp: Date.now()
    };

    const fileName = `${job.id}.json`;
    const filePath = path.join(PROCESSING_DIR, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(job));
    console.log(`[Queue] Added job ${job.id} to queue`);

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
        const jobData = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as QueueJob;
        return jobData;
      }
    }

    return null;
  }

  public async getJobState(jobId: string): Promise<string> {
    const job = await this.getJob(jobId);
    if (!job) return 'notfound';

    if (fs.existsSync(path.join(COMPLETED_DIR, `${jobId}.json`))) {
      return 'completed';
    }

    if (fs.existsSync(path.join(FAILED_DIR, `${jobId}.json`))) {
      return 'failed';
    }

    return 'processing';
  }

  public stop() {
    this.processing = false;
  }
}

export default FileSystemQueue.getInstance(); 