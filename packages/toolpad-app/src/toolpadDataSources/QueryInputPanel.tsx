import * as React from 'react';
import { Box, Toolbar } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FlexFill from '../components/FlexFill';

export interface QueryInputPanelProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  onRunPreview: () => void;
}

export default function QueryInputPanel({ children, onRunPreview, actions }: QueryInputPanelProps) {
  return (
    <Box sx={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        <LoadingButton startIcon={<PlayArrowIcon />} onClick={onRunPreview}>
          Preview
        </LoadingButton>
        <FlexFill />
        {actions}
      </Toolbar>
      {children}
    </Box>
  );
}
