import * as React from 'react';
import {
  Box,
  CircularProgress,
  IconButton,
  ThemeProvider,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SaveIcon from '@mui/icons-material/Save';
import { ToolpadFile } from '../shared/schemas';
import DataGridFileEditor from './DataGridFileEditor';
import { getTheme } from './theme';
import { useBacked } from './backend';
import { CodeGenerationResult, generateComponent } from '../shared/codeGeneration';
import DevtoolHost from './DevtoolHost';
import { getComponentNameFromInputFile } from '../shared/paths';

const CONNECTION_STATUS_DISPLAY = {
  connecting: { label: 'Connecting', color: 'info.main' },
  connected: { label: 'Connected', color: 'success.main' },
  disconnected: { label: 'Disconnected', color: 'error.main' },
};

interface FileEditorProps {
  value: ToolpadFile;
  onChange: (value: ToolpadFile) => void;
  source?: CodeGenerationResult;
  commitButton: React.ReactNode;
}

function FileEditor({ commitButton, value, onChange, source }: FileEditorProps) {
  switch (value.kind) {
    case 'DataGrid':
      return (
        <DataGridFileEditor
          value={value}
          onChange={onChange}
          source={source}
          commitButton={commitButton}
        />
      );
    default:
      return <Typography>Unknown file: {value.kind}</Typography>;
  }
}

function useConnectionStatus() {
  const backend = useBacked();
  return React.useSyncExternalStore(
    (cb) => backend.subscribe('connectionStatusChange', cb),
    () => backend.getConnectionStatus(),
  );
}

export interface DevtoolOverlayProps {
  filePath: string;
  value: ToolpadFile;
  onChange: (value: ToolpadFile) => void;
  onCommit: () => void;
  dependencies: readonly [string, () => Promise<unknown>][];
  onClose?: () => void;
}

export default function DevtoolOverlay({
  filePath,
  value,
  onChange,
  onClose,
  onCommit,
  dependencies,
}: DevtoolOverlayProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const name = getComponentNameFromInputFile(filePath);

  const connectionStatus = useConnectionStatus();

  const [source, setSource] = React.useState<CodeGenerationResult | undefined>(undefined);

  React.useEffect(() => {
    const outDir = '/';
    generateComponent(filePath, value, { target: 'prod', outDir })
      .then((result) => {
        setSource(result);
      })
      .catch((error) => {
        console.error(error);
        setSource(undefined);
      });
  }, [value, filePath, dependencies]);

  const commitButton = (
    <Tooltip title="Commit changes">
      <IconButton sx={{ m: 0.5 }} onClick={onCommit}>
        <SaveIcon />
      </IconButton>
    </Tooltip>
  );

  const muiTheme = useTheme();
  const theme = getTheme(muiTheme.palette.mode);

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
              {name} ({value.kind})
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
                value={value}
                onChange={onChange}
                source={source}
                commitButton={commitButton}
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
