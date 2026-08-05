export interface FileInfo {
  name: string;
  extension: string;
  size: number;
  type: string; // 'MP3' | 'Unknown'
  status: 'correct' | 'repair' | 'skip';
  handle: FileSystemFileHandle;
}

export interface ScanResult {
  files: FileInfo[];
  total: number;
  correct: number;
  repairable: number;
  skipped: number;
}
