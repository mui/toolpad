import * as React from 'react';
import { Button, Typography, Box, useTheme, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useMatch } from 'react-router-dom';
import { IS_CUSTOM_SERVER, PREVIEW_HEADER_HEIGHT } from './constants';

export default function PreviewHeader() {
  const pageMatch = useMatch('/pages/:slug');
  const activePage = pageMatch?.params.slug;

  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        width: '100%',
        height: PREVIEW_HEADER_HEIGHT,
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Alert
        severity="warning"
        // variant="filled"
        sx={{
          borderRadius: 0,
        }}
        action={
          IS_CUSTOM_SERVER ? null : (
            <Button
              color="inherit"
              size="small"
              endIcon={<EditIcon />}
              component="a"
              href={activePage ? `/_toolpad/app/pages/${activePage}` : '/_toolpad/app'}
            >
              Edit
            </Button>
          )
        }
      >
        <Typography variant="body2">
          This is a preview version of the application. It&apos;s not suitable for production.
        </Typography>
      </Alert>
    </Box>
  );
}
