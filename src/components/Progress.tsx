import { Box, LinearProgress, Typography, Paper } from '@mui/material';

interface ProgressProps {
  /** 当前进度数 */
  current: number;
  /** 总数 */
  total: number;
  /** 当前处理的文件名 */
  fileName?: string;
  /** 类型：扫描还是修复 */
  type: 'scan' | 'repair';
}

export default function Progress({ current, total, fileName, type }: ProgressProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  const label = type === 'scan' ? '正在扫描...' : '正在修复...';

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={700} color="primary.main">
          {current} / {total} ({percent}%)
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={percent}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
          },
        }}
      />

      {fileName && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {fileName}
        </Typography>
      )}
    </Paper>
  );
}
