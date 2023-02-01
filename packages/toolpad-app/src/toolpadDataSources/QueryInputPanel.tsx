import * as React from 'react';
import { Alert, Box, Toolbar, Link } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useParams } from 'react-router-dom';
import FlexFill from '../components/FlexFill';
import { DOCUMENTATION_INSTALLATION_URL } from '../constants';
import config from '../config';
import { addUTMParamsToUrl, DEMO_CAMPAIGN_NAME, sendSelfHostClickEvent } from '../utils/ga';

export interface QueryInputPanelProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  onRunPreview: () => void;
}

export default function QueryInputPanel({ children, onRunPreview, actions }: QueryInputPanelProps) {
  const { appId } = useParams();

  const handleSelfHostLinkClick = React.useCallback(() => {
    sendSelfHostClickEvent(appId, 'queryPanel');
  }, [appId]);

  return (
    <Box sx={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {config.isDemo ? (
        <Alert severity="info" sx={{ ml: 1, mr: 1, mt: 1 }}>
          Can only run queries in browser in demo mode.
          <br />
          <Link
            href={addUTMParamsToUrl(DOCUMENTATION_INSTALLATION_URL, {
              source: 'query_panel',
              medium: 'organic_toolpad',
              campaign: DEMO_CAMPAIGN_NAME,
            })}
            target="_blank"
            onClick={handleSelfHostLinkClick}
          >
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
