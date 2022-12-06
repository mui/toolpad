import * as React from 'react';
import { Alert, Box, Toolbar, Link } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FlexFill from '../components/FlexFill';
import { DOCUMENTATION_INSTALLATION_URL } from '../constants';
import config from '../config';

export interface QueryInputPanelProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  onRunPreview: () => void;
}

export default function QueryInputPanel({ children, onRunPreview, actions }: QueryInputPanelProps) {
  return (
    <Box sx={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {config.isDemo ? (
        <Alert severity="info" sx={{ ml: 1, mr: 1, mt: 1 }}>
          Can only run queries in browser in demo mode.
          <br />
          <Link href={DOCUMENTATION_INSTALLATION_URL} target="_blank">
            Try self-hosting
          </Link>{' '}
          for full functionality.
        </Alert>
      ) : null}
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
