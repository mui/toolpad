import * as React from 'react';
import { TabPanel, TabContext, TabList } from '@mui/lab';
import { Box, IconButton, styled, SxProps, Tab } from '@mui/material';
import { Har } from 'har-format';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import Console, { LogEntry } from './Console';
import lazyComponent from '../utils/lazyComponent';

const HarViewer = lazyComponent(() => import('./HarViewer'), {});

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
    <Box sx={{ ...sx, display: 'flex', flexDirection: 'column' }}>
      <TabContext value={activeTab}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            pr: 1,
          }}
        >
          <TabList onChange={handleDebuggerTabChange} aria-label="Debugger">
            {log ? <Tab label="Console" value="console" /> : null}
            {har ? <Tab label="Network" value="network" /> : null}
          </TabList>
          {handleClearClick ? (
            <IconButton disabled={!clearEnabled} onClick={handleClearClick}>
              <DoDisturbIcon />
            </IconButton>
          ) : null}
        </Box>
        {log ? (
          <DebuggerTabPanel value="console">
            <Console sx={{ flex: 1 }} value={log} />
          </DebuggerTabPanel>
        ) : null}
        {har ? (
          <DebuggerTabPanel value="network">
            <HarViewer sx={{ flex: 1 }} value={har} />
          </DebuggerTabPanel>
        ) : null}
      </TabContext>
    </Box>
  );
}
