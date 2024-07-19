import * as React from 'react';
import { WebContainer } from '@webcontainer/api';
import { generateProject } from 'create-toolpad-app';
import { Box, CircularProgress, CssBaseline, GlobalStyles } from '@mui/material';

const files = {};

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

for (const [name, { content }] of generateProject({ name: 'demo' })) {
  const segments = name.split('/');
  const folders = segments.slice(0, segments.length - 1);
  const folder = ensureFolder(folders, files);
  const file = segments[segments.length - 1];
  folder[file] = { file: { contents: content } };
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

  React.useEffect(() => {
    if (!frameRef.current) {
      throw new Error('Frame not found');
    }

    if (webcontainerPromiseRef.current) {
      return;
    }

    const frame = frameRef.current;

    const webcontainerPromise = webcontainerPromiseRef.current ?? WebContainer.boot();
    webcontainerPromiseRef.current = webcontainerPromise;

    webcontainerPromise.then(async (instance) => {
      if (webcontainerPromiseRef.current !== webcontainerPromise) {
        return;
      }

      await instance.mount(files);

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

    // eslint-disable-next-line consistent-return
    return () => {
      // webcontainerPromise.then((instance) => instance.teardown());
    };
  }, []);

  const [loading, setLoading] = React.useState(true);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', padding: 2 }}>
      <CssBaseline />
      <GlobalStyles styles={{ 'html, body, #__next': { width: '100%', height: '100%' } }} />
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

      <iframe
        ref={frameRef}
        title="Application"
        style={{ display: 'block', width: '100%', height: '100%' }}
        onLoad={() => {
          setLoading(false);
        }}
      />
    </Box>
  );
}
