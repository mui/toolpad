import * as React from 'react';
import { Box, Toolbar } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FlexFill from '../components/FlexFill';

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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        {actions}
        <FlexFill />
        <LoadingButton
          startIcon={<PlayArrowIcon />}
          onClick={onRunPreview}
          disabled={previewDisabled}
        >
          Preview
        </LoadingButton>
      </Toolbar>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>{children}</Box>
    </Box>
  );
}
