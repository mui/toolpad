import * as React from 'react';
import { TabPanel, TabContext, TabList } from '@mui/lab';
import { Box, styled, SxProps, Tab } from '@mui/material';
import { Har } from 'har-format';
import Console, { LogEntry } from './Console';
import lazyComponent from '../utils/lazyComponent';

const HarViewer = lazyComponent(() => import('./HarViewer'), {});

const DebuggerTabPanel = styled(TabPanel)({ padding: 0, flex: 1, minHeight: 0 });

export interface DevtoolsProps {
  log?: LogEntry[];
  onLogChange?: (newLog: LogEntry[]) => void;
  har?: Har;
  sx?: SxProps;
}

export default function Devtools({ sx, log, onLogChange, har }: DevtoolsProps) {
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

  return (
    <Box sx={{ ...sx, display: 'flex', flexDirection: 'column' }}>
      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleDebuggerTabChange} aria-label="Debugger">
            {log ? <Tab label="Console" value="console" /> : null}
            {har ? <Tab label="Network" value="network" /> : null}
          </TabList>
        </Box>
        {log ? (
          <DebuggerTabPanel value="console">
            <Console sx={{ flex: 1 }} value={log} onChange={onLogChange} />
          </DebuggerTabPanel>
        ) : null}
        {har ? (
          <DebuggerTabPanel value="network">
            <HarViewer har={har} />
          </DebuggerTabPanel>
        ) : null}
      </TabContext>
    </Box>
  );
}
