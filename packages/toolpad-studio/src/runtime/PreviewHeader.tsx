import * as React from 'react';
import { Button, Typography, Box, useTheme, Alert, ButtonProps } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Link, useMatch } from 'react-router';
import { useAppHost } from '@toolpad/studio-runtime';

function OpenInEditorButton<C extends React.ElementType>({
  children = 'Open in editor',
  ...props
}: ButtonProps<C>) {
  return (
    <Button color="inherit" size="small" startIcon={<EditIcon />} {...props}>
      {children}
    </Button>
  );
}

export default function PreviewHeader() {
  const pageMatch = useMatch('/pages/:slug');
  const activePage = pageMatch?.params.slug;

  const theme = useTheme();

  const appContext = useAppHost();

  let action: React.ReactNode = null;

  action = (
    <OpenInEditorButton
      component={Link}
      to={activePage ? `/editor/app/pages/${activePage}` : '/editor/app'}
    />
  );

  return appContext ? (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        zIndex: theme.zIndex.drawer + 2,
      }}
    >
      <Alert
        severity="warning"
        sx={{
          borderRadius: 0,
        }}
        action={action}
      >
        <Typography variant="body2">
          This is a preview version of the application, not suitable for production.
        </Typography>
      </Alert>
    </Box>
  ) : null;
}
