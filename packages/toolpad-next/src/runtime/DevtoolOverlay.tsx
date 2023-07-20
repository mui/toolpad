import * as React from 'react';
import { Box, CircularProgress, IconButton, ThemeProvider, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { ToolpadFile } from '../shared/schemas';
import DataGridFileEditor from './DataGridFileEditor';
import theme from './theme';
import { useServer } from './server';
import { GeneratedFile, generateComponent } from '../shared/codeGeneration';
import DevtoolHost from './DevtoolHost';

const CONNECTION_STATUS_DISPLAY = {
  connecting: { label: 'Connecting', color: 'info.main' },
  connected: { label: 'Connected', color: 'success.main' },
  disconnected: { label: 'Disconnected', color: 'error.main' },
};

interface FileEditorProps {
  name: string;
  value: ToolpadFile;
  onChange: (value: ToolpadFile) => void;
  onClose?: () => void;
  source?: string;
}

function FileEditor({ name, value, onChange, onClose, source }: FileEditorProps) {
  switch (value.kind) {
    case 'DataGrid':
      return (
        <DataGridFileEditor
          name={name}
          value={value}
          onChange={onChange}
          onClose={onClose}
          source={source}
        />
      );
    default:
      return <Typography>Unknown file: {value.kind}</Typography>;
  }
}

export interface DevtoolOverlayProps {
  name: string;
  file: ToolpadFile;
  onClose?: () => void;
}

export default function DevtoolOverlay({ name, file, onClose }: DevtoolOverlayProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = React.useState(file);

  const { connectionStatus } = useServer();

  const [generatedFile, setGeneratedFile] = React.useState<GeneratedFile | null>(null);

  React.useEffect(() => {
    generateComponent(name, file, { dev: false }).then(
      (result) => {
        setGeneratedFile(result);
      },
      (error) => {
        console.error(error);
        setGeneratedFile(null);
      },
    );
  }, [file, name]);

  return (
    <ThemeProvider theme={theme}>
      <DevtoolHost>
        <Box
          ref={rootRef}
          sx={{
            width: '100%',
            height: '100%',
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
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 190,
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
                    backgroundColor: CONNECTION_STATUS_DISPLAY[connectionStatus].color,
                  }}
                />
                <Typography>{CONNECTION_STATUS_DISPLAY[connectionStatus].label}</Typography>
              </Box>
              <IconButton size="small" onClick={onClose}>
                <CloseIcon fontSize="inherit" />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            {connectionStatus === 'connected' ? (
              <FileEditor
                name={name}
                value={inputValue}
                onChange={setInputValue}
                onClose={onClose}
                source={generatedFile?.code}
              />
            ) : (
              <Box
                sx={{
                  position: 'absolute',
                  inset: '0 0 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  gap: 1,
                }}
              >
                {connectionStatus === 'disconnected' ? (
                  <React.Fragment>
                    <ErrorOutlineIcon color="error" />
                    Connection lost
                  </React.Fragment>
                ) : (
                  <CircularProgress />
                )}
              </Box>
            )}
          </Box>
        </Box>
      </DevtoolHost>
    </ThemeProvider>
  );
}
