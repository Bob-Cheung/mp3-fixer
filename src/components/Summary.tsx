import { Box, Paper, Typography } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { ScanResult } from '../types/file';

interface SummaryProps {
  result: ScanResult;
}

const statCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  px: 2.5,
  py: 2,
  borderRadius: 2,
  flex: 1,
  minWidth: 130,
};

export default function Summary({ result }: SummaryProps) {
  const items = [
    {
      icon: <InsertDriveFileIcon />,
      label: '总文件',
      value: result.total,
      color: 'primary.main',
      bg: 'primary.50',
      bgColor: (t: any) => t.palette.primary.main + '0d',
    },
    {
      icon: <CheckCircleIcon />,
      label: '已正确',
      value: result.correct,
      color: 'success.main',
      bgColor: (t: any) => t.palette.success.main + '0d',
    },
    {
      icon: <BuildCircleIcon />,
      label: '可修复',
      value: result.repairable,
      color: 'warning.main',
      bgColor: (t: any) => t.palette.warning.main + '0d',
    },
    {
      icon: <CancelIcon />,
      label: '跳过',
      value: result.skipped,
      color: 'error.main',
      bgColor: (t: any) => t.palette.error.main + '0d',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      {items.map((item) => (
        <Paper
          key={item.label}
          variant="outlined"
          sx={{
            ...statCardStyle,
            bgcolor: item.bgColor,
            borderColor: (t: any) =>
              (item.bgColor as any)?.replace?.('0d', '33') || 'divider',
          }}
        >
          <Box sx={{ color: item.color, display: 'flex' }}>{item.icon}</Box>
          <Box>
            <Typography variant="h5" fontWeight={700} color={item.color}>
              {item.value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.label}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
