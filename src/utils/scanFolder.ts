import { FileInfo } from '../types/file';
import { isMp3File } from './detectMp3';

export async function scanFolder(
  dirHandle: FileSystemDirectoryHandle,
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<FileInfo[]> {
  const files: FileInfo[] = [];
  const entries: FileSystemFileHandle[] = [];

  // 迭代收集所有文件句柄（不递归子目录，V1）
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') {
      entries.push(entry as FileSystemFileHandle);
    }
  }

  const total = entries.length;
  for (let i = 0; i < total; i++) {
    const handle = entries[i];
    const file = await handle.getFile();
    const name = file.name;
    const dotIndex = name.lastIndexOf('.');
    const basename = dotIndex >= 0 ? name.substring(0, dotIndex) : name;
    const extension = dotIndex >= 0 ? name.substring(dotIndex + 1).toLowerCase() : '';

    onProgress?.(i + 1, total, name);

    // 判断扩展名
    const isMp3Extension = extension === 'mp3';

    // 读取文件头判断真实格式
    const isMp3Format = await isMp3File(handle);

    let status: FileInfo['status'];
    if (isMp3Format && isMp3Extension) {
      // 扩展名正确
      status = 'correct';
    } else if (isMp3Format && !isMp3Extension) {
      // 可修复（无扩展名或错误扩展名）
      status = 'repair';
    } else {
      // 不是 MP3，跳过
      status = 'skip';
    }

    files.push({
      name: basename,
      extension,
      size: file.size,
      type: isMp3Format ? 'MP3' : 'Unknown',
      status,
      handle,
    });
  }

  return files;
}
