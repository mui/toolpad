import * as React from 'react';
import { TabPanel, TabContext, TabList } from '@mui/lab';
import { Box, IconButton, LinearProgress, styled, SxProps, Tab } from '@mui/material';
import type { Har } from 'har-format';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import Console, { LogEntry } from './Console';
import lazyComponent from '../utils/lazyComponent';
import CenteredSpinner from './CenteredSpinner';

const HarViewer = lazyComponent(() => import('./HarViewer'), {
  fallback: <CenteredSpinner />,
});

const DebuggerTabPanel = styled(TabPanel)({ padding: 0, flex: 1, minHeight: 0 });

export interface DevtoolsProps {
  log?: LogEntry[];
  onLogClear?: () => void;
  har?: Har;
  onHarClear?: () => void;
  sx?: SxProps;
}

export default function Devtools({ sx, log, onLogClear, har, onHarClear }: DevtoolsProps) {
  const [activeTab, setActiveTab] = React.useState(() => {
    if (log) {
      return 'console';
    }
    if (har) {
      return 'network';
    }
    return '';
  });

  const handleDebuggerTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const logLength = log?.length ?? 0;
  const harLength = har?.log.entries.length ?? 0;

  const clearEnabled: boolean = React.useMemo(() => {
    switch (activeTab) {
      case 'console':
        return logLength > 0;
      case 'network':
        return harLength > 0;
      default:
        throw new Error(`Missing switch case ${activeTab}`);
    }
  }, [activeTab, harLength, logLength]);

  const handleClearClick = React.useCallback(() => {
    switch (activeTab) {
      case 'console':
        return onLogClear?.();
      case 'network':
        return onHarClear?.();
      default:
        throw new Error(`Missing switch case ${activeTab}`);
    }
  }, [activeTab, onHarClear, onLogClear]);

  return (
    <Box
      sx={{
        ...sx,
        flexDirection: 'column',
      }}
    >
      <TabContext value={activeTab}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'start',
            pr: 1,
          }}
        >
          {handleClearClick ? (
            <IconButton disabled={!clearEnabled} onClick={handleClearClick}>
              <DoDisturbIcon />
            </IconButton>
          ) : null}

          <TabList
            onChange={handleDebuggerTabChange}
            aria-label="Debugger"
            sx={{ '& button': { fontSize: 12, fontWeight: 'normal' } }}
          >
            {log ? (
              <Tab
                label="Console"
                value="console"
                sx={{ borderBottom: (theme) => `1px solid ${theme.palette.grey[300]}` }}
              />
            ) : null}
            {har ? (
              <Tab
                label="Network"
                value="network"
                sx={{ borderBottom: (theme) => `1px solid ${theme.palette.grey[300]}` }}
              />
            ) : null}
          </TabList>
        </Box>

        {log ? (
          <DebuggerTabPanel value="console">
            <Console sx={{ flex: 1 }} value={log} />
          </DebuggerTabPanel>
        ) : null}
        {har ? (
          <DebuggerTabPanel value="network">
            <React.Suspense fallback={<LinearProgress />}>
              <HarViewer sx={{ flex: 1 }} value={har} />
            </React.Suspense>
          </DebuggerTabPanel>
        ) : null}
      </TabContext>
    </Box>
  );
}
