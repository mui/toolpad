import * as React from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Toolbar, IconButton, Typography, Button } from '@mui/material';
import { Box } from '@mui/system';
import { Link } from 'react-router-dom';

interface StudioAppBarProps {
  appId: string;
  actions: React.ReactNode;
}

export default function StudioAppBar({ appId, actions }: StudioAppBarProps) {
  return (
    <AppBar position="static" sx={{ zIndex: 2 }}>
      <Toolbar variant="dense">
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" color="inherit" component="div">
          MUI Studio
        </Typography>
        <Button component={Link} to={`/app/${appId}/editor`} color="inherit">
          Editor
        </Button>
        <Button component={Link} to={`/app/${appId}/releases`} color="inherit">
          Releases
        </Button>
        <Box flex={1} />
        {actions}
      </Toolbar>
    </AppBar>
  );
}
