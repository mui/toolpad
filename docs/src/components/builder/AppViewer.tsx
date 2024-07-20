import * as React from 'react';
import { WebContainer } from '@webcontainer/api';
import { Box, CircularProgress, Typography, styled } from '@mui/material';
import { Files } from 'create-toolpad-app';

const AppFrame = styled('iframe')(({ theme }) => ({
  border: `1px solid ${theme.vars.palette.divider}`,
  borderRadius: theme.vars.shape.borderRadius,
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

type WebcontainerFolder = Record<
  string,
  | { directory: WebcontainerFolder; file?: undefined }
  | { directory?: undefined; file: { contents: string } }
>;

// TODO: generate types for create-toolpad-app API
function createWebcontainerFiles(flatFiles: Files): WebcontainerFolder {
  const files: WebcontainerFolder = {};
  for (const [name, { content }] of flatFiles) {
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

export interface AppViewerProps {
  sx?: React.CSSProperties;
  files?: Files;
}

export default function AppViewer({ sx, files = new Map() }: AppViewerProps) {
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const webcontainerPromiseRef = React.useRef<Promise<WebContainer> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [rebuilding, setRebuilding] = React.useState(false);
  const isRebuildingRef = React.useRef(rebuilding);
  React.useEffect(() => {
    isRebuildingRef.current = rebuilding;
  }, [rebuilding]);

  const webcontainerFiles = React.useMemo(() => createWebcontainerFiles(files), [files]);

  const bootFilesref = React.useRef(webcontainerFiles);
  React.useEffect(() => {
    bootFilesref.current = webcontainerFiles;
  }, [webcontainerFiles]);

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
            if (isRebuildingRef.current && data.includes('Compiled in')) {
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

  const prevFiles = React.useRef(files);
  React.useEffect(() => {
    const changes = new Map();

    for (const [name, { content }] of files) {
      if (prevFiles.current.get(name)?.content !== content) {
        changes.set(name, { content });
      }
    }

    prevFiles.current = files;

    if (changes.size <= 0) {
      return;
    }

    Promise.resolve(webcontainerPromiseRef.current).then(async (instance) => {
      if (!instance) {
        throw new Error('Instance not found');
      }

      for (const [name, { content }] of changes) {
        instance.fs.writeFile(name, content);
      }

      setRebuilding(true);
    });
  }, [files]);

  return (
    <Box sx={sx}>
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
          <Typography>{'// TODO: show progress. (check the console for now)'}</Typography>
        </Box>
      ) : null}

      <AppFrame
        ref={frameRef}
        title="Application"
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </Box>
  );
}
