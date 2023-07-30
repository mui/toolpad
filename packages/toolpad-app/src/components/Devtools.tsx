import * as React from 'react';
import { TabPanel, TabContext, TabList } from '@mui/lab';
import { Box, Button, IconButton, styled, SxProps, Paper, Tab } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { Har } from 'har-format';
import Draggable from 'react-draggable';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import BugReportIcon from '@mui/icons-material/BugReport';
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

function PaperComponent({ children }: { children: React.ReactNode }) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper sx={{ position: 'fixed', bottom: '10vh', right: '1vw', maxHeight: 400, width: 500 }}>
        {children}
      </Paper>
    </Draggable>
  );
}

export default function Devtools({ sx, log, onLogClear, har, onHarClear }: DevtoolsProps) {
  const [open, setOpen] = React.useState(false);
  const handleClose = React.useCallback(() => {
    setOpen(false);
  }, []);
  const [activeTab, setActiveTab] = React.useState(() => {
    if (log) {
      return 'console';
    }
    if (har) {
      return 'network';
    }
    return '';
  });

  const buttonStyles = React.useCallback(
    (theme: Theme) => ({
      color:
        theme.palette.mode === 'dark' ? theme.palette.primaryDark[400] : theme.palette.grey[400],
      fontSize: 12,
      ml: 1,
      mt: 0,
      transition: theme.transitions.create('color', {
        duration: theme.transitions.duration.shorter,
      }),
      '&:hover': {
        color:
          theme.palette.mode === 'dark' ? theme.palette.primaryDark[300] : theme.palette.grey[500],
        backgroundColor: theme.palette.mode === 'dark' ? 'inherit' : theme.palette.grey[100],
      },
    }),
    [],
  );

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
    <React.Fragment>
      <Box
        sx={{
          ...sx,
          display: open ? 'flex' : 'none',
          flexDirection: 'column',
        }}
      >
        <PaperComponent>
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
              <IconButton id={'draggable-dialog-title'} sx={{ cursor: 'move' }}>
                <DragIndicatorIcon />
              </IconButton>
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
              <IconButton onClick={handleClose} disableRipple>
                <ClearOutlinedIcon fontSize="inherit" sx={buttonStyles} />
              </IconButton>
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
        </PaperComponent>
      </Box>

      <Button
        onClick={() => setOpen(true)}
        sx={(theme) => buttonStyles(theme)}
        startIcon={<BugReportIcon />}
        disabled={!logLength && !harLength}
      >
        Debug
      </Button>
    </React.Fragment>
  );
}
