import React from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Toolbar, IconButton, Typography, Button } from '@mui/material';
import { Box } from '@mui/system';
import { NextLinkComposed } from './Link';

interface StudioAppBarProps {
  actions: React.ReactNode;
}

export default function StudioAppBar({ actions }: StudioAppBarProps) {
  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" color="inherit" component="div">
          MUI Studio
        </Typography>
        <Button component={NextLinkComposed} to="/_studio/editor" color="inherit">
          Editor
        </Button>
        <Button component={NextLinkComposed} to="/_studio/connections" color="inherit">
          Connections
        </Button>
        <Button component={NextLinkComposed} to="/_studio/apis" color="inherit">
          Apis
        </Button>
        <Box flex={1} />
        {actions}
      </Toolbar>
    </AppBar>
  );
}
