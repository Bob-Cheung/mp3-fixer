import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
} from '@mui/material';
import { FileInfo } from '../types/file';

interface ScanTableProps {
  files: FileInfo[];
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

const statusConfig: Record<FileInfo['status'], { label: string; color: 'success' | 'warning' | 'default' }> = {
  correct: { label: '已正确', color: 'success' },
  repair: { label: '可修复', color: 'warning' },
  skip: { label: '跳过', color: 'default' },
};

export default function ScanTable({ files }: ScanTableProps) {
  if (files.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography color="text.secondary">未发现文件</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 420 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>文件名</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>大小</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>实际格式</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>状态</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {files.map((file, index) => {
            const config = statusConfig[file.status];
            return (
              <TableRow
                key={`${file.name}-${index}`}
                hover
                sx={{
                  '&:last-child td': { border: 0 },
                  opacity: file.status === 'skip' ? 0.5 : 1,
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {file.name}
                    {file.extension ? `.${file.extension}` : ''}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatFileSize(file.size)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={file.type}
                    size="small"
                    color={file.type === 'MP3' ? 'primary' : 'default'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={config.label}
                    size="small"
                    color={config.color}
                    variant={file.status === 'skip' ? 'outlined' : 'filled'}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
