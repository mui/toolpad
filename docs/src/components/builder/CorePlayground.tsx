import * as React from 'react';
import { generateProject } from 'create-toolpad-app';
import { Box, Button, CssBaseline, Stack, TextField, Typography } from '@mui/material';
import AppViewer from './AppViewer';
import CodeViewer from './CodeViewer';

function getPackageVersion(packageName: string) {
  const commitRef = process.env.PULL_REQUEST_ID ? process.env.COMMIT_REF : undefined;

  if (commitRef === undefined) {
    // #default-branch-switch
    // Use the "latest" npm tag for the master git branch
    // Use the "next" npm tag for the next git branch
    return 'latest';
  }
  const shortSha = commitRef.slice(0, 8);
  return `https://pkg.csb.dev/mui/mui-toolpad/commit/${shortSha}/${packageName}`;
}

export default function CorePlayground() {
  const [optionsInput, setOptionsInput] = React.useState({
    name: 'demo',
    title: 'Toolpad',
    toolpadCoreVersion: getPackageVersion('@toolpad/core'),
  });

  const [optionsValue, setOptionsValue] = React.useState(optionsInput);

  const handleNewOptions: React.Dispatch<React.SetStateAction<any>> = (newoptions) => {
    setOptionsValue(typeof newoptions === 'function' ? newoptions(optionsValue) : newoptions);
  };

  const projectFiles = React.useMemo(() => generateProject(optionsValue), [optionsValue]);

  const [showCode, setShowCode] = React.useState(false);

  return (
    <React.Fragment>
      <CssBaseline />
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
        <Stack sx={{ width: 250, gap: 1 }}>
          <TextField
            size="small"
            fullWidth
            label="Project title"
            value={optionsInput.title}
            onChange={(event) =>
              setOptionsInput((prev) => ({ ...prev, title: event.target.value }))
            }
          />
          <Typography> {'// TODO: branding icon...'}</Typography>
          <Typography> {'// TODO: theme colors...'}</Typography>
          <Typography> {'// TODO: pages...'}</Typography>
          <Button
            onClick={() => handleNewOptions(optionsInput)}
            disabled={optionsInput === optionsValue}
          >
            Apply Changes
          </Button>
          <Button
            // eslint-disable-next-line no-alert
            onClick={() => window.alert('// TODO: package files into zip and download')}
          >
            Download project
          </Button>
          <Button onClick={() => setShowCode((prev) => !prev)}>Code view</Button>
        </Stack>
        <Box sx={{ position: 'relative', flex: 1 }}>
          <AppViewer files={projectFiles} />
          {showCode ? (
            <CodeViewer sx={{ position: 'absolute', inset: '0 0 0 0' }} files={projectFiles} />
          ) : null}
        </Box>
      </Box>
    </React.Fragment>
  );
}
