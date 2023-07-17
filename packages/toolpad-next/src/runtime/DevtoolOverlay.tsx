import * as React from 'react';
import { Box, IconButton, ThemeProvider, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ToolpadFile } from '../shared/schemas';
import DataGridFileEditor from './DataGridFileEditor';
import theme from './theme';
import { ConnectionStatus, useServer } from './server';

interface FileEditorProps {
  name: string;
  value: ToolpadFile;
  onChange: (value: ToolpadFile) => void;
}

function FileEditor({ name, value, onChange }: FileEditorProps) {
  switch (value.kind) {
    case 'DataGrid':
      return <DataGridFileEditor name={name} value={value} onChange={onChange} />;
    default:
      return <Typography>Unknown file: {value.kind}</Typography>;
  }
}

function getConnectionStatusMessage(status: ConnectionStatus) {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'disconnected':
      return 'Disconnected';
    default:
      return 'Unknown';
  }
}

function getConnectionStatusIndicatorColor(status: ConnectionStatus) {
  switch (status) {
    case 'connected':
      return 'success.main';
    case 'disconnected':
      return 'error.main';
    default:
      return 'info.main';
  }
}

export interface DevtoolOverlayProps {
  name: string;
  file: ToolpadFile;
  onClose?: () => void;
}

export default function DevtoolOverlay({ name, file, onClose }: DevtoolOverlayProps) {
  const height = '50vh';

  const [inputValue, setInputValue] = React.useState(file);

  React.useEffect(() => {
    const originalMarginBottom = document.body.style.marginBottom;
    document.body.style.marginBottom = height;
    return () => {
      document.body.style.marginBottom = originalMarginBottom;
    };
  }, [height]);

  const { connectionStatus } = useServer();

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height,
          background: 'white',
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
            pl: 2,
          }}
        >
          <Typography>
            {name} ({file.kind})
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography>Status:</Typography>
            <Box
              sx={{
                display: 'inline-block',
                borderRadius: '50%',
                width: 16,
                height: 16,
                backgroundColor: getConnectionStatusIndicatorColor(connectionStatus),
              }}
            />
            <Typography>{getConnectionStatusMessage(connectionStatus)}</Typography>

            <IconButton size="small" onClick={onClose}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <FileEditor name={name} value={inputValue} onChange={setInputValue} />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
