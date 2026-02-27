import { UploadJob } from '../types/upload';

const DB_NAME = 'sore-upload-outbox';
const STORE_NAME = 'upload-jobs';
const DB_VERSION = 1;

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const runTransaction = async <T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore, resolve: (value: T) => void, reject: (reason?: unknown) => void) => void
): Promise<T> => {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    action(store, resolve, reject);
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error);
  });
};

export const saveUploadJobToOutbox = async (job: UploadJob): Promise<void> => {
  await runTransaction<void>('readwrite', (store, resolve, reject) => {
    const req = store.put(job);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

export const removeUploadJobFromOutbox = async (jobId: string): Promise<void> => {
  await runTransaction<void>('readwrite', (store, resolve, reject) => {
    const req = store.delete(jobId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

export const getUploadJobsFromOutbox = async (): Promise<UploadJob[]> =>
  runTransaction<UploadJob[]>('readonly', (store, resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as UploadJob[]);
    req.onerror = () => reject(req.error);
  });
