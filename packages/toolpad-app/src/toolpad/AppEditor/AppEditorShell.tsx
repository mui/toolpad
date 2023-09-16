import { Box, Button, Stack, Tooltip, CircularProgress, styled } from '@mui/material';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import SyncIcon from '@mui/icons-material/Sync';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { AppState, useAppState } from '../AppState';
import ToolpadShell from '../ToolpadShell';
import PagePanel from './PagePanel';
import { PageEditorProvider } from './PageEditor/PageEditorProvider';
import { getViewFromPathname } from '../../utils/domView';
import { PropControlsContextProvider, PropTypeControls } from '../propertyControls';
import string from '../propertyControls/string';
import boolean from '../propertyControls/boolean';
import number from '../propertyControls/number';
import select from '../propertyControls/select';
import json from '../propertyControls/json';
import markdown from '../propertyControls/Markdown';
import eventControl from '../propertyControls/event';
import GridColumns from '../propertyControls/GridColumns';
import SelectOptions from '../propertyControls/SelectOptions';
import ChartData from '../propertyControls/ChartData';
import RowIdFieldSelect from '../propertyControls/RowIdFieldSelect';
import HorizontalAlign from '../propertyControls/HorizontalAlign';
import VerticalAlign from '../propertyControls/VerticalAlign';
import NumberFormat from '../propertyControls/NumberFormat';
import ColorScale from '../propertyControls/ColorScale';

const PAGE_PANEL_WIDTH = 250;

const propTypeControls: PropTypeControls = {
  string,
  boolean,
  number,
  select,
  json,
  markdown,
  event: eventControl,
  GridColumns,
  SelectOptions,
  ChartData,
  RowIdFieldSelect,
  HorizontalAlign,
  VerticalAlign,
  NumberFormat,
  ColorScale,
};

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

const Centered = styled('div')({
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

function FullPageLoader() {
  return (
    <Centered>
      <CircularProgress />
    </Centered>
  );
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
      {currentPageId ? (
        <PageEditorProvider key={currentPageId} nodeId={currentPageId}>
          <PropControlsContextProvider value={propTypeControls}>
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
                  width: PAGE_PANEL_WIDTH,
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
          </PropControlsContextProvider>
        </PageEditorProvider>
      ) : (
        <FullPageLoader />
      )}
    </ToolpadShell>
  );
}
