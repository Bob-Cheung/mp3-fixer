/**
 * 读取文件头部字节，通过魔术数字（Magic Number）判断是否为 MP3 文件。
 *
 * MP3 文件头特征：
 * - "ID3" (ID3v2 标签，位于文件开头)
 * - 0xFF 0xFB / 0xFF 0xFA / 0xFF 0xF3 / 0xFF 0xF2 (MPEG 帧同步头)
 */

const MP3_SYNC_PATTERNS: number[][] = [
  [0xff, 0xfb], // MPEG1 Layer3
  [0xff, 0xfa], // MPEG1 Layer2
  [0xff, 0xf3], // MPEG2 Layer3
  [0xff, 0xf2], // MPEG2 Layer2
];

async function readFileHead(
  handle: FileSystemFileHandle,
  bytes: number
): Promise<Uint8Array | null> {
  try {
    const file = await handle.getFile();
    const slice = file.slice(0, bytes);
    const buffer = await slice.arrayBuffer();
    return new Uint8Array(buffer);
  } catch {
    return null;
  }
}

function startsWith(data: Uint8Array, prefix: number[]): boolean {
  if (data.length < prefix.length) return false;
  for (let i = 0; i < prefix.length; i++) {
    if (data[i] !== prefix[i]) return false;
  }
  return true;
}

function hasMpegSync(data: Uint8Array): boolean {
  // 在整个数据中搜索 MPEG 同步帧头（跳过可能的 ID3v2 标签）
  for (let i = 0; i < data.length - 1; i++) {
    if (data[i] === 0xff && (data[i + 1] & 0xe0) === 0xe0) {
      return true;
    }
  }
  return false;
}

export async function isMp3File(handle: FileSystemFileHandle): Promise<boolean> {
  // 读取前 4KB 用于检测（足够覆盖 ID3v2 头和 MPEG 帧）
  const head = await readFileHead(handle, 4096);
  if (!head) return false;

  // 检查 ID3v2 标签 "ID3"
  if (startsWith(head, [0x49, 0x44, 0x33])) {
    return true;
  }

  // 检查 MPEG 帧同步头
  if (hasMpegSync(head)) {
    return true;
  }

  return false;
}

/**
 * 仅依靠文件头部前几个字节快速判断
 */
export async function isMp3FileFast(handle: FileSystemFileHandle): Promise<boolean> {
  const head = await readFileHead(handle, 16);
  if (!head) return false;

  // ID3v2
  if (startsWith(head, [0x49, 0x44, 0x33])) return true;

  // MPEG sync 0xFF 0xFB/FA/F3/F2
  if (head.length >= 2 && head[0] === 0xff && (head[1] & 0xe0) === 0xe0) {
    return true;
  }

  return false;
}
