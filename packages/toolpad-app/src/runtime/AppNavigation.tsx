import * as React from 'react';
import {
  Drawer,
  Box,
  List,
  ListSubheader,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
} from '@mui/material';
import { useLocation, useHref, Link } from 'react-router-dom';
import * as appDom from '../appDom';

const DRAWER_WIDTH = 250; // px

interface AppNavigationProps {
  pages: appDom.PageNode[];
  clipped?: boolean;
}

export default function AppNavigation({ pages, clipped = false }: AppNavigationProps) {
  const location = useLocation();
  const { search } = location;
  const href = useHref('');

  const activePagePath = location.pathname.replace(href, '');

  const navListSubheaderId = React.useId();

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      open
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      {clipped ? <Toolbar variant="dense" /> : null}
      <Box>
        <List
          component="nav"
          subheader={
            <ListSubheader id={navListSubheaderId} sx={{ px: 4 }}>
              Pages
            </ListSubheader>
          }
          aria-labelledby={navListSubheaderId}
        >
          {pages.map((page) => (
            <ListItem key={page.id} disablePadding>
              <ListItemButton
                component={Link}
                to={`pages/${page.id}${search}`}
                selected={activePagePath === `/pages/${page.id}`}
              >
                <ListItemText primary={page.name} sx={{ ml: 2 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
