export type UploadFileState = 'queued' | 'processing' | 'completed' | 'failed' | 'notfound';

export interface UploadFileItem {
  fileName: string;
  status: UploadFileState;
  progress: number;
  message: string;
  jobId?: string;
}

export type UploadKind = 'MEMORY' | 'IMAGE' | 'IDEA';

export interface UploadJobMeta {
  memoryId?: number;
  kind?: UploadKind;
}

export interface UploadJob {
  id: string;
  createdAt: number;
  status: UploadFileState;
  meta?: UploadJobMeta;
  files: UploadFileItem[];
}

export interface UploadSummary {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  progress: number;
}
