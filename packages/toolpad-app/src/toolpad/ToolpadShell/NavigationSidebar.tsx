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
  Typography,
  IconButton,
} from '@mui/material';
import { Link, matchPath, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 72; // px

const Drawer = styled(MuiDrawer)({
  width: DRAWER_WIDTH,
  '& .MuiDrawer-paper': {
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

export default function NavigationSidebar() {
  const location = useLocation();

  return (
    <Drawer variant="permanent" anchor="left" open>
      <Toolbar variant="dense" />
      <List component="nav" sx={{ pt: 1 }}>
        {navigationOptions.map(({ name, path, icon }) => {
          const OptionIcon = icon;

          const isSelected = !!matchPath(`${path}/*`, location.pathname);

          return (
            <ListItem key={name} sx={{ pt: 1, pb: 1, pl: 0, pr: 0 }}>
              <Link to={path} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Stack
                  flex={1}
                  direction="column"
                  alignItems="center"
                  sx={{ width: DRAWER_WIDTH - 1 }}
                >
                  <IconButton color="primary" sx={{ p: 1.5, mb: 0.5 }}>
                    <OptionIcon color={isSelected ? 'primary' : 'action'} fontSize="medium" />
                  </IconButton>
                  <Typography
                    fontSize={11}
                    fontWeight={isSelected ? 'bold' : 'regular'}
                    color={isSelected ? 'primary' : 'default'}
                    textAlign="center"
                  >
                    {name}
                  </Typography>
                </Stack>
              </Link>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}
