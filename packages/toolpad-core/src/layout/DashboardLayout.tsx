import * as React from 'react';
import {
  AppBar,
  Badge,
  Box,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  NoSsr,
  Toolbar,
  Typography,
} from '@mui/material';
// Must use named imports or icons crash when the component is imported to a Next.js app
// eslint-disable-next-line no-restricted-imports
import {
  Notifications as NotificationsIcon,
  Mail as MailIcon,
  Inbox as InboxIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 240;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <NoSsr>
      <Box sx={{ display: 'flex' }}>
        <AppBar
          color="inherit"
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              MUI
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: 'flex' }}>
              <IconButton size="large" aria-label="Show new notifications" color="inherit">
                <Badge badgeContent={18} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text) => (
                <ListItem key={text} disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <MailIcon />
                    </ListItemIcon>
                    <ListItemText primary={text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider />
            <List>
              {['All mail', 'Trash', 'Spam'].map((text) => (
                <ListItem key={text} disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <InboxIcon />
                    </ListItemIcon>
                    <ListItemText primary={text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
        <Box component={'main'} sx={{ flexGrow: 1, height: '100vh', overflow: 'auto' }}>
          <Toolbar />
          <Container maxWidth="lg">{children}</Container>
        </Box>
      </Box>
    </NoSsr>
  );
}
