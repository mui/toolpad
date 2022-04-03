import * as React from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { Box } from '@mui/system';

export interface AppBarProps {
  navigation: React.ReactNode;
  actions: React.ReactNode;
}

export default function AppHeader({ actions, navigation }: AppBarProps) {
  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ zIndex: 2, borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar variant="dense">
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          component="a"
          href={`/`}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" color="inherit" component="div" sx={{ mr: 2 }}>
          MUI Toolpad
        </Typography>
        {navigation}
        <Box flex={1} />
        {actions}
      </Toolbar>
    </AppBar>
  );
}
