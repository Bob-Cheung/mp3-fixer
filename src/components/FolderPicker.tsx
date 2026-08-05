import { Box, Button, Typography, Chip } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface FolderPickerProps {
  dirName: string | null;
  onSelect: (handle: FileSystemDirectoryHandle) => void;
  disabled?: boolean;
}

export default function FolderPicker({ dirName, onSelect, disabled }: FolderPickerProps) {
  const handleClick = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      onSelect(handle);
    } catch (err) {
      // 用户取消选择不报错
      if ((err as DOMException).name === 'AbortError') return;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        py: 4,
        px: 3,
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: '2px dashed',
        borderColor: dirName ? 'success.main' : 'divider',
        transition: 'border-color 0.3s',
      }}
    >
      <FolderOpenIcon
        sx={{
          fontSize: 56,
          color: dirName ? 'success.main' : 'action.disabled',
          transition: 'color 0.3s',
        }}
      />

      <Button
        variant={dirName ? 'outlined' : 'contained'}
        size="large"
        startIcon={<FolderOpenIcon />}
        onClick={handleClick}
        disabled={disabled}
        sx={{ minWidth: 180 }}
      >
        选择文件夹
      </Button>

      {dirName ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            当前目录：
          </Typography>
          <Chip
            icon={<CheckCircleIcon />}
            label={dirName}
            color="success"
            variant="outlined"
            size="small"
          />
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          请选择包含音乐文件的文件夹
        </Typography>
      )}
    </Box>
  );
}
