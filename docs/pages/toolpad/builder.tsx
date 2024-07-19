import * as React from 'react';
import { WebContainer } from '@webcontainer/api';
import { generateProject } from 'create-toolpad-app';
import {
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  GlobalStyles,
  TextField,
  Typography,
  styled,
} from '@mui/material';

const AppFrame = styled('iframe')(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  width: '100%',
  height: '100%',
}));

function ensureFolder(folders: string[], containingFolder: Record<string, any>) {
  if (folders.length <= 0) {
    return containingFolder;
  }
  const [first, ...rest] = folders;
  let folder = containingFolder[first];
  if (!folder) {
    folder = { directory: {} };
    containingFolder[first] = folder;
  }
  return ensureFolder(rest, folder.directory);
}

type Folder = Record<
  string,
  { directory: Folder; file?: undefined } | { directory?: undefined; file: { contents: string } }
>;

// TODO: generate types for create-toolpad-app API
function createFiles(options: any): Folder {
  const files: Folder = {};
  for (const [name, { content }] of generateProject(options)) {
    const segments = name.split('/');
    const folders = segments.slice(0, segments.length - 1);
    const folder = ensureFolder(folders, files);
    const file = segments[segments.length - 1];
    folder[file] = { file: { contents: content } };
  }
  return files;
}

async function installDependencies(instance: WebContainer) {
  // Install dependencies
  const installProcess = await instance.spawn('npm', ['install', '--force']);
  installProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        // eslint-disable-next-line no-console
        console.log(data);
      },
    }),
  );
  // Wait for install command to exit
  return installProcess.exit;
}

export default function Builder() {
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const webcontainerPromiseRef = React.useRef<Promise<WebContainer> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [rebuilding, setRebuilding] = React.useState(false);

  const [optionsInput, setOptionsInput] = React.useState({
    name: 'demo',
    title: 'Toolpad',
  });

  const [optionsValue, setOptionsValue] = React.useState(optionsInput);

  const handleNewOptions: React.Dispatch<React.SetStateAction<any>> = (newoptions) => {
    setOptionsValue(typeof newoptions === 'function' ? newoptions(optionsValue) : newoptions);

    Promise.resolve(webcontainerPromiseRef.current).then(async (instance) => {
      if (instance) {
        const newFiles = createFiles(newoptions);
        const newLayoutContent = newFiles.app.directory?.['layout.tsx'].file?.contents;
        if (!newLayoutContent) {
          throw new Error('Layout file not found');
        }
        instance.fs.writeFile('/app/layout.tsx', newLayoutContent);
        setRebuilding(true);
      }
    });
  };

  const files = React.useMemo(() => createFiles(optionsValue), [optionsValue]);

  const bootFilesref = React.useRef(files);
  React.useEffect(() => {
    bootFilesref.current = files;
  }, [files]);

  React.useEffect(() => {
    if (!frameRef.current) {
      throw new Error('Frame not found');
    }

    const frame = frameRef.current;

    const webcontainerPromise = Promise.resolve(webcontainerPromiseRef.current).then(async () =>
      WebContainer.boot(),
    );
    setLoading(true);

    webcontainerPromiseRef.current = webcontainerPromise;

    webcontainerPromise.then(async (instance) => {
      if (webcontainerPromiseRef.current !== webcontainerPromise) {
        return;
      }

      await instance.mount(bootFilesref.current);

      const exitCode = await installDependencies(instance);
      if (exitCode !== 0) {
        throw new Error('Installation failed');
      }

      // Run `npm run dev` to start the next.js dev server
      const devProcess = await instance.spawn('npm', ['run', 'dev']);

      devProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            // eslint-disable-next-line no-console
            console.log(data);
            if (data.includes('Compiled /page')) {
              setLoading(false);
            }
            if (rebuilding && data.includes('Compiled in')) {
              setRebuilding(false);
            }
          },
        }),
      );

      // Wait for `server-ready` event
      instance.on('server-ready', (port, url) => {
        frame.src = `${url}/page`;
      });
    });

    return () => {
      if (!webcontainerPromiseRef.current) {
        return;
      }
      webcontainerPromiseRef.current.then((instance) => {
        instance.teardown();
      });
    };
  }, []);

  return (
    <React.Fragment>
      <CssBaseline />
      <GlobalStyles styles={{ 'html, body, #__next': { width: '100%', height: '100%' } }} />
      <Box
        sx={{
          width: '100%',
          height: '100%',
          padding: 2,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          gap: 2,
        }}
      >
        <Box sx={{ width: 250 }}>
          <TextField
            size="small"
            fullWidth
            label="Project title"
            value={optionsInput.title}
            onChange={(event) =>
              setOptionsInput((prev) => ({ ...prev, title: event.target.value }))
            }
          />
          <Button
            onClick={() => handleNewOptions(optionsInput)}
            disabled={optionsInput === optionsValue}
          >
            Apply Changes
          </Button>
        </Box>
        <Box sx={{ position: 'relative', flex: 1 }}>
          {loading || rebuilding ? (
            <Box
              sx={{
                position: 'absolute',
                inset: '0 0 0 0',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress />
              <Typography>TODO: show progress. (check the console)</Typography>
            </Box>
          ) : null}

          <AppFrame
            ref={frameRef}
            title="Application"
            style={{ display: 'block', width: '100%', height: '100%' }}
          />
        </Box>
      </Box>
    </React.Fragment>
  );
}
