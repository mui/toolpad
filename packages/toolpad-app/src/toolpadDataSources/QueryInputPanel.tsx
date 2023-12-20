import * as React from 'react';
import { Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export interface QueryInputPanelProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  previewDisabled?: boolean;
  onRunPreview: () => void;
}

export default function QueryInputPanel({
  children,
  onRunPreview,
  actions,
  previewDisabled,
}: QueryInputPanelProps) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'row' }}>
      {actions}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>{children}</Box>
      <LoadingButton
        startIcon={<PlayArrowIcon />}
        onClick={onRunPreview}
        disabled={previewDisabled}
        variant="outlined"
      >
        Preview
      </LoadingButton>
    </Box>
  );
}
