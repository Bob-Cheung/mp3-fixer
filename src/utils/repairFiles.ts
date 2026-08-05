import { FileInfo } from '../types/file';

export interface RepairProgress {
  current: number;
  total: number;
  fileName: string;
  success: boolean;
  error?: string;
}

/**
 * 获取可用的输出目录名，若已存在则自动递增
 */
async function getOutputDirHandle(
  parentHandle: FileSystemDirectoryHandle,
  baseName: string
): Promise<FileSystemDirectoryHandle> {
  let name = baseName;
  let counter = 1;

  while (true) {
    try {
      const handle = await parentHandle.getDirectoryHandle(name, { create: true });
      return handle;
    } catch {
      name = `${baseName}_${counter}`;
      counter++;
    }
  }
}

/**
 * 获取原始目录的父级句柄
 * 由于 File System Access API 的限制，我们无法直接获取父目录，
 * 因此输出目录创建在用户选择的目录同级。
 * 实际做法：让用户选择父目录，或在扫描目录内创建输出子目录。
 *
 * 这里采用在当前扫描目录内创建输出子目录的方案。
 */
export async function repairFiles(
  dirHandle: FileSystemDirectoryHandle,
  repairableFiles: FileInfo[],
  onProgress?: (progress: RepairProgress) => void
): Promise<{ outputDirName: string; successCount: number; failCount: number }> {
  const outputDirName = await resolveOutputDirName(dirHandle);
  const outputDir = await dirHandle.getDirectoryHandle(outputDirName, { create: true });

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < repairableFiles.length; i++) {
    const fileInfo = repairableFiles[i];
    const newFileName = `${fileInfo.name}.mp3`;

    try {
      // 读取原文件内容
      const file = await fileInfo.handle.getFile();
      const content = await file.arrayBuffer();

      // 在输出目录创建新文件
      const newFileHandle = await outputDir.getFileHandle(newFileName, { create: true });
      const writable = await newFileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      successCount++;
      onProgress?.({
        current: i + 1,
        total: repairableFiles.length,
        fileName: newFileName,
        success: true,
      });
    } catch (err) {
      failCount++;
      onProgress?.({
        current: i + 1,
        total: repairableFiles.length,
        fileName: newFileName,
        success: false,
        error: err instanceof Error ? err.message : '未知错误',
      });
    }
  }

  return { outputDirName, successCount, failCount };
}

async function resolveOutputDirName(
  dirHandle: FileSystemDirectoryHandle
): Promise<string> {
  let counter = 0;
  while (true) {
    const suffix = counter === 0 ? '_mp3' : `_mp3_${counter}`;
    const name = `output${suffix}`; // output_mp3, output_mp3_1, ...

    try {
      // 尝试获取（不创建）看是否存在
      await dirHandle.getDirectoryHandle(name);
      // 存在，递增
      counter++;
    } catch {
      // 不存在，可用
      return name;
    }
  }
}
