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

// TODO: generate types for create-toolpad-app API
function createFiles(options: any) {
  const files = {};
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
  const installProcess = await instance.spawn('npm', ['install']);
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

  const [optionsInput, setOptionsInput] = React.useState({
    name: 'demo',
    title: 'Toolpad',
  });

  const [optionsValue, setOptionsValue] = React.useState(optionsInput);

  const handleNewOptions: React.Dispatch<React.SetStateAction<any>> = (newoptions) => {
    setOptionsValue(typeof newoptions === 'function' ? newoptions(optionsValue) : newoptions);

    Promise.resolve(webcontainerPromiseRef.current).then(async (instance) => {
      if (instance) {
        instance.mount(createFiles(newoptions));
      }
    });
  };

  const files = React.useMemo(() => createFiles(optionsValue), [optionsValue]);

  // Stable vale for initial files, do not modify unless you want to reboot the web container
  // e.g. to load a different runtime
  const [bootFiles] = React.useState(files);

  React.useEffect(() => {
    if (!frameRef.current) {
      throw new Error('Frame not found');
    }

    const frame = frameRef.current;

    const webcontainerPromise = Promise.resolve(webcontainerPromiseRef.current).then(
      async (maybeInstance) => {
        if (maybeInstance) {
          await maybeInstance.teardown();
        }
        return WebContainer.boot();
      },
    );

    webcontainerPromiseRef.current = webcontainerPromise;

    webcontainerPromise.then(async (instance) => {
      if (webcontainerPromiseRef.current !== webcontainerPromise) {
        return;
      }

      await instance.mount(bootFiles);

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
          },
        }),
      );

      // Wait for `server-ready` event
      instance.on('server-ready', (port, url) => {
        frame.src = `${url}/page`;
      });
    });
  }, [bootFiles]);

  const [loading, setLoading] = React.useState(true);

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
        }}
      >
        <Box sx={{ width: 250 }}>
          <TextField
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
          {loading ? (
            <Box
              sx={{
                position: 'absolute',
                inset: '0 0 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress />
            </Box>
          ) : null}

          <AppFrame
            ref={frameRef}
            title="Application"
            style={{ display: 'block', width: '100%', height: '100%' }}
            onLoad={() => {
              setLoading(false);
            }}
          />
        </Box>
      </Box>
    </React.Fragment>
  );
}
