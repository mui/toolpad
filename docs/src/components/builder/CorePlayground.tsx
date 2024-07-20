import * as React from 'react';
import { generateProject } from 'create-toolpad-app';
import { Box, Button, CssBaseline, Stack, TextField, Typography } from '@mui/material';
import AppViewer from './AppViewer';

export default function CorePlayground() {
  const [optionsInput, setOptionsInput] = React.useState({
    name: 'demo',
    title: 'Toolpad',
  });

  const [optionsValue, setOptionsValue] = React.useState(optionsInput);

  const handleNewOptions: React.Dispatch<React.SetStateAction<any>> = (newoptions) => {
    setOptionsValue(typeof newoptions === 'function' ? newoptions(optionsValue) : newoptions);
  };

  const projectFiles = React.useMemo(() => generateProject(optionsValue), [optionsValue]);

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
          <Button
            // eslint-disable-next-line no-alert
            onClick={() => window.alert('// TODO: Show code files in code editor (read only)')}
          >
            Code view
          </Button>
        </Stack>
        <AppViewer sx={{ position: 'relative', flex: 1 }} files={projectFiles} />
      </Box>
    </React.Fragment>
  );
}
