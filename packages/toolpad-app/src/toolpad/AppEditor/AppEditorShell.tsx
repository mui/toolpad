import { Box, Button, Stack, Tooltip } from '@mui/material';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import SyncIcon from '@mui/icons-material/Sync';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { AppState, useAppState } from '../AppState';
import ToolpadShell from '../ToolpadShell';
import PagePanel from './PagePanel';
import { getViewFromPathname } from '../../utils/domView';

function getSaveState(appState: AppState): React.ReactNode {
  if (appState.saveDomError) {
    return (
      <Tooltip title="Error while saving">
        <SyncProblemIcon color="primary" />
      </Tooltip>
    );
  }

  const isSaving = appState.unsavedDomChanges > 0;

  if (isSaving) {
    return (
      <Tooltip title="Saving changes…">
        <SyncIcon color="primary" />
      </Tooltip>
    );
  }

  return (
    <Tooltip title="All changes saved!">
      <CloudDoneIcon color="primary" />
    </Tooltip>
  );
}

export interface ToolpadShellProps {
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function AppEditorShell({ children, ...props }: ToolpadShellProps) {
  const appState = useAppState();

  const location = useLocation();

  const currentView = getViewFromPathname(location.pathname);
  const currentPageId = currentView?.kind === 'page' ? currentView.nodeId : null;

  const previewPath = currentPageId ? `/preview/pages/${currentPageId}` : '/preview';

  return (
    <ToolpadShell
      actions={
        <Stack direction="row" gap={1} alignItems="center">
          <Button
            variant="outlined"
            endIcon={<OpenInNewIcon />}
            color="primary"
            component="a"
            href={previewPath}
            target="_blank"
          >
            Preview
          </Button>
        </Stack>
      }
      status={getSaveState(appState)}
      {...props}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          height: '100%',
        }}
      >
        <PagePanel
          sx={{
            width: 250,
            borderRight: 1,
            borderColor: 'divider',
          }}
        />
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {children}
        </Box>
      </Box>
    </ToolpadShell>
  );
}
