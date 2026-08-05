import { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Divider,
  Alert,
  Link,
  Stack,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FolderPicker from '../components/FolderPicker';
import Summary from '../components/Summary';
import ScanTable from '../components/ScanTable';
import Progress from '../components/Progress';
import { useScan } from '../hooks/useScan';
import { useRepair } from '../hooks/useRepair';

export default function Home() {
  const scan = useScan();
  const repair = useRepair();
  const [dirName, setDirName] = useState<string | null>(null);

  const handleSelectFolder = async (handle: FileSystemDirectoryHandle) => {
    setDirName(handle.name);
    await scan.startScan(handle);
  };

  const handleStartRepair = async () => {
    if (!scan.dirHandle || !scan.result) return;
    const repairableFiles = scan.result.files.filter((f) => f.status === 'repair');
    if (repairableFiles.length === 0) return;
    await repair.startRepair(scan.dirHandle, repairableFiles);
  };

  const handleReset = () => {
    scan.resetScan();
    repair.resetRepair();
    setDirName(null);
  };

  const repairableCount = scan.result?.repairable ?? 0;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="md">
        {/* 标题 */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
            🎵 MP3 后缀修复工具
          </Typography>
          <Typography variant="body2" color="text.secondary">
            纯本地处理 · 不上传文件 · 保护隐私安全
          </Typography>
        </Box>

        {/* 错误提示 */}
        {scan.error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={scan.resetScan}>
            {scan.error}
          </Alert>
        )}
        {repair.error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={repair.resetRepair}>
            {repair.error}
          </Alert>
        )}

        {/* 文件夹选择 */}
        <FolderPicker
          dirName={dirName}
          onSelect={handleSelectFolder}
          disabled={scan.scanning || repair.repairing}
        />

        {/* 扫描进度 */}
        {scan.scanning && scan.progress && (
          <Box sx={{ mt: 3 }}>
            <Progress
              current={scan.progress.current}
              total={scan.progress.total}
              fileName={scan.progress.fileName}
              type="scan"
            />
          </Box>
        )}

        {/* 扫描结果 */}
        {scan.result && (
          <>
            <Divider sx={{ my: 3 }} />

            {/* 统计 */}
            <Typography variant="h6" fontWeight={600} gutterBottom>
              扫描结果
            </Typography>
            <Summary result={scan.result} />

            <Divider sx={{ my: 3 }} />

            {/* 文件列表 */}
            <Typography variant="h6" fontWeight={600} gutterBottom>
              文件列表
            </Typography>
            <ScanTable files={scan.result.files} />

            {/* 修复进度 */}
            {repair.repairing && repair.progress && (
              <Box sx={{ mt: 3 }}>
                <Progress
                  current={repair.progress.current}
                  total={repair.progress.total}
                  fileName={repair.progress.fileName}
                  type="repair"
                />
              </Box>
            )}

            {/* 操作按钮 */}
            <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
                disabled={repair.repairing}
              >
                重新选择
              </Button>

              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrowIcon />}
                onClick={handleStartRepair}
                disabled={repairableCount === 0 || repair.repairing || scan.scanning}
              >
                开始修复 ({repairableCount})
              </Button>
            </Stack>
          </>
        )}

        {/* 修复完成 */}
        {repair.completed && (
          <Box sx={{ mt: 3 }}>
            <Alert
              severity="success"
              action={
                <Button
                  color="inherit"
                  size="small"
                  endIcon={<OpenInNewIcon />}
                >
                  打开输出目录
                </Button>
              }
            >
              修复完成！成功 {repair.successCount} 个，失败 {repair.failCount} 个。
              {repair.outputDirName && (
                <>
                  {' '}输出目录：
                  <Typography component="span" fontWeight={700}>
                    {repair.outputDirName}
                  </Typography>
                </>
              )}
            </Alert>
          </Box>
        )}

        {/* 底部提示 - 无文件时快捷显示 */}
        {scan.result && scan.result.total === 0 && (
          <Alert severity="info" sx={{ mt: 3 }}>
            当前目录为空，请选择包含文件的目录。
          </Alert>
        )}

        {/* 浏览器兼容性提示 */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="caption" color="text.disabled">
            适用于 Chrome/Edge 浏览器 ·
            <Link
              href="https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API"
              target="_blank"
              underline="hover"
              sx={{ ml: 0.5 }}
            >
              关于 File System Access API
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
