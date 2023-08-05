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
import * as path from 'path-browserify';
import { ToolpadFile } from '../shared/schemas';
import DataGridFileEditor from './DataGridFileEditor';
import theme from './theme';
import { useServer } from './server';
import { CodeGenerationResult, generateComponent } from '../shared/codeGeneration';
import DevtoolHost from './DevtoolHost';
import { getComponentNameFromInputFile, getOutputPathForInputFile } from '../shared/paths';

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

interface ModuleInstance {
  exports: unknown;
}

async function evaluate(
  files: Map<string, { code: string }>,
  entry: string,
  dependencies = new Map<string, ModuleInstance>(),
) {
  const cache = new Map<string, ModuleInstance>(dependencies);
  const extensions = ['.js', '.jsx', '.ts', '.tsx'];

  const resolveId = (importee: string, importer: string) => {
    if (importee.startsWith('.') || importee.startsWith('/')) {
      const resolved = path.resolve(path.dirname(importer), importee);
      if (files.has(resolved)) {
        return path.resolve(path.dirname(importer), importee);
      }

      for (const ext of extensions) {
        const resolvedWithExt = resolved + ext;
        if (files.has(resolvedWithExt)) {
          return resolvedWithExt;
        }
      }
    } else if (dependencies.has(importee)) {
      return importee;
    }

    throw new Error(`Could not resolve "${importee}" from "${importer}"`);
  };

  const createRequireFn = (importer: string) => (importee: string) => {
    const resolved = resolveId(importee, importer);

    const cached = cache.get(resolved);

    if (cached) {
      return cached.exports;
    }

    const mod = files.get(resolved);

    if (!mod) {
      throw new Error(`Can't find a module for "${importee}"`);
    }

    const compiled = sucrase.transform(mod.code, {
      transforms: ['imports', 'typescript', 'jsx'],
    });

    const fn = new Function('module', 'exports', 'require', compiled.code);
    const exportsObj: unknown = {};
    const moduleObj = { exports: exportsObj };
    const requireFn = createRequireFn(resolved);
    fn(moduleObj, exportsObj, requireFn);

    cache.set(resolved, moduleObj);

    return moduleObj.exports;
  };

  const requireEntry = createRequireFn('/');

  return requireEntry(entry);
}

export interface DevtoolOverlayProps {
  filePath: string;
  file: ToolpadFile;
  dependencies: readonly [string, () => Promise<unknown>][];
  onClose?: () => void;
  onCommitted?: () => void;
  onComponentUpdate?: (Component: React.ComponentType) => void;
}

export default function DevtoolOverlay({
  filePath,
  file,
  onComponentUpdate,
  onClose,
  onCommitted,
  dependencies,
}: DevtoolOverlayProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const name = getComponentNameFromInputFile(filePath);

  const [inputValue, setInputValue] = React.useState(file);

  const { connectionStatus } = useServer();

  const [source, setSource] = React.useState<CodeGenerationResult | undefined>(undefined);

  React.useEffect(() => {
    const outDir = '/';
    generateComponent(filePath, inputValue, { target: 'prod', outDir })
      .then((result) => {
        setSource(result);
      })
      .catch((error) => {
        console.error(error);
        setSource(undefined);
      });
  }, [inputValue, filePath, dependencies, onComponentUpdate]);

  React.useEffect(() => {
    const outDir = '/';
    generateComponent(filePath, inputValue, { target: 'preview', outDir })
      .then(async (result) => {
        const resolvedDependencies = await Promise.all(
          dependencies.map(
            async ([k, v]) => [k, { exports: await v() }] satisfies [string, unknown],
          ),
        );

        const outputPath = getOutputPathForInputFile(filePath, outDir);

        const moduleExports = await evaluate(
          new Map(result.files),
          outputPath,
          new Map(resolvedDependencies),
        );

        const NewComponent = (moduleExports as any)?.default as React.ComponentType;
        invariant(
          typeof NewComponent === 'function',
          `Compilation must result in a function as default export`,
        );
        onComponentUpdate?.(NewComponent);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [inputValue, filePath, dependencies, onComponentUpdate]);

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
