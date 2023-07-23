import * as React from 'react';
import * as sucrase from 'sucrase';
import {
  Box,
  CircularProgress,
  IconButton,
  ThemeProvider,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import invariant from 'invariant';
import SaveIcon from '@mui/icons-material/Save';
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
  value: ToolpadFile;
  onChange: (value: ToolpadFile) => void;
  source?: string;
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

export interface DevtoolOverlayProps {
  name: string;
  file: ToolpadFile;
  dependencies: [string, unknown][];
  onClose?: () => void;
  onCommitted?: () => void;
  onComponentUpdate?: (Component: React.ComponentType) => void;
}

export default function DevtoolOverlay({
  name,
  file,
  onComponentUpdate,
  onClose,
  onCommitted,
  dependencies,
}: DevtoolOverlayProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = React.useState(file);

  const { connectionStatus } = useServer();

  const [source, setSource] = React.useState<GeneratedFile | null>(null);

  React.useEffect(() => {
    generateComponent(name, inputValue, { target: 'prod' })
      .then((result) => {
        setSource(result);
      })
      .catch((error) => {
        console.error(error);
        setSource(null);
      });
  }, [inputValue, name, dependencies, onComponentUpdate]);

  React.useEffect(() => {
    generateComponent(name, inputValue, { target: 'preview' })
      .then((result) => {
        const compiled = sucrase.transform(result.code, {
          transforms: ['imports', 'typescript', 'jsx'],
        });
        const fn = new Function('module', 'exports', 'require', compiled.code);
        const exports: any = {};
        const module = { exports };
        const dependencyRegistry = new Map(dependencies);
        const require = (moduleId: string) => {
          const mod = dependencyRegistry.get(moduleId);
          if (mod) {
            return mod;
          }
          throw new Error(`Module "${moduleId}" not found`);
        };
        fn(module, exports, require);
        const NewComponent = module.exports.default as React.ComponentType;
        invariant(
          typeof NewComponent === 'function',
          `Compilation must result in a function as default export`,
        );
        onComponentUpdate?.(NewComponent);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [inputValue, name, dependencies, onComponentUpdate]);

  const server = useServer();

  const commitButton = (
    <Tooltip title="Commit changes">
      <IconButton
        sx={{ m: 0.5 }}
        onClick={() => {
          server.saveFile(name, inputValue).then(() => onCommitted?.());
        }}
      >
        <SaveIcon />
      </IconButton>
    </Tooltip>
  );

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
                value={inputValue}
                onChange={setInputValue}
                source={source?.code}
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
