import { useState, useCallback, useRef } from 'react';
import { FileInfo } from '../types/file';
import { repairFiles, RepairProgress } from '../utils/repairFiles';

interface RepairState {
  repairing: boolean;
  progress: RepairProgress | null;
  completed: boolean;
  outputDirName: string | null;
  successCount: number;
  failCount: number;
  error: string | null;
}

export function useRepair() {
  const [state, setState] = useState<RepairState>({
    repairing: false,
    progress: null,
    completed: false,
    outputDirName: null,
    successCount: 0,
    failCount: 0,
    error: null,
  });

  const abortRef = useRef(false);

  const startRepair = useCallback(
    async (dirHandle: FileSystemDirectoryHandle, repairableFiles: FileInfo[]) => {
      abortRef.current = false;
      setState({
        repairing: true,
        progress: null,
        completed: false,
        outputDirName: null,
        successCount: 0,
        failCount: 0,
        error: null,
      });

      try {
        const result = await repairFiles(dirHandle, repairableFiles, (progress) => {
          if (!abortRef.current) {
            setState((prev) => ({ ...prev, progress }));
          }
        });

        if (!abortRef.current) {
          setState((prev) => ({
            ...prev,
            repairing: false,
            completed: true,
            outputDirName: result.outputDirName,
            successCount: result.successCount,
            failCount: result.failCount,
          }));
        }
      } catch (err) {
        if (!abortRef.current) {
          setState((prev) => ({
            ...prev,
            repairing: false,
            error: err instanceof Error ? err.message : '修复失败，请重试。',
          }));
        }
      }
    },
    []
  );

  const cancelRepair = useCallback(() => {
    abortRef.current = true;
  }, []);

  const resetRepair = useCallback(() => {
    abortRef.current = false;
    setState({
      repairing: false,
      progress: null,
      completed: false,
      outputDirName: null,
      successCount: 0,
      failCount: 0,
      error: null,
    });
  }, []);

  return {
    ...state,
    startRepair,
    cancelRepair,
    resetRepair,
  };
}
