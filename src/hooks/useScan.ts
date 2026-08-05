import { useState, useCallback, useRef } from 'react';
import { FileInfo, ScanResult } from '../types/file';
import { scanFolder } from '../utils/scanFolder';

interface ScanState {
  scanning: boolean;
  progress: { current: number; total: number; fileName: string } | null;
  result: ScanResult | null;
  error: string | null;
}

export function useScan() {
  const [state, setState] = useState<ScanState>({
    scanning: false,
    progress: null,
    result: null,
    error: null,
  });

  const dirHandleRef = useRef<FileSystemDirectoryHandle | null>(null);

  const startScan = useCallback(async (dirHandle: FileSystemDirectoryHandle) => {
    dirHandleRef.current = dirHandle;
    setState({
      scanning: true,
      progress: { current: 0, total: 0, fileName: '' },
      result: null,
      error: null,
    });

    try {
      const files: FileInfo[] = await scanFolder(dirHandle, (current, total, fileName) => {
        setState((prev) => ({
          ...prev,
          progress: { current, total, fileName },
        }));
      });

      const correct = files.filter((f) => f.status === 'correct').length;
      const repairable = files.filter((f) => f.status === 'repair').length;
      const skipped = files.filter((f) => f.status === 'skip').length;

      const result: ScanResult = {
        files,
        total: files.length,
        correct,
        repairable,
        skipped,
      };

      setState({
        scanning: false,
        progress: null,
        result,
        error: null,
      });
    } catch (err) {
      setState({
        scanning: false,
        progress: null,
        result: null,
        error: err instanceof Error ? err.message : '扫描失败，请重试。',
      });
    }
  }, []);

  const resetScan = useCallback(() => {
    dirHandleRef.current = null;
    setState({
      scanning: false,
      progress: null,
      result: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    dirHandle: dirHandleRef.current,
    startScan,
    resetScan,
  };
}
