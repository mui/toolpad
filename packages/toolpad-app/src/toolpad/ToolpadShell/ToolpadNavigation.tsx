import * as React from 'react';
import { styled } from '@mui/material/styles';
import ArticleIcon from '@mui/icons-material/Article';
import FunctionsIcon from '@mui/icons-material/Functions';
import {
  ListItem,
  Toolbar,
  Drawer as MuiDrawer,
  List,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Link, matchPath, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 44; // px

const Drawer = styled(MuiDrawer)({
  width: DRAWER_WIDTH,
  '& .MuiDrawer-paper': {
    overflow: 'hidden',
    width: DRAWER_WIDTH,
  },
});

const navigationOptions = [
  {
    name: 'Pages',
    path: '/app/pages',
    icon: ArticleIcon,
  },
  {
    name: 'Functions',
    path: '/app/functions',
    icon: FunctionsIcon,
  },
];

export default function ToolpadNavigation() {
  const location = useLocation();

  return (
    <Drawer variant="permanent" anchor="left" open>
      <Toolbar variant="dense" />
      <List component="nav" sx={{ pt: 1 }}>
        {navigationOptions.map(({ name, path, icon }) => {
          const OptionIcon = icon;

          const isSelected = !!matchPath(`${path}/*`, location.pathname);

          return (
            <ListItem key={name} sx={{ pt: 0.5, pb: 0.5, pl: 0, pr: 0 }}>
              <Link to={path} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Stack
                  flex={1}
                  direction="column"
                  alignItems="center"
                  sx={{ width: DRAWER_WIDTH - 1 }}
                >
                  <Tooltip title={name} placement="right">
                    <IconButton>
                      <OptionIcon color={isSelected ? 'primary' : 'action'} fontSize="medium" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Link>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}
