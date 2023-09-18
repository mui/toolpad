import * as React from 'react';
import { styled } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ArticleIcon from '@mui/icons-material/Article';
import FunctionsIcon from '@mui/icons-material/Functions';
import { Paper, Toolbar, useTheme } from '@mui/material';
import { Link, matchPath, useLocation } from 'react-router-dom';

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => {
    const width = open ? 180 : 54;

    return {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      width,
      '& .MuiDrawer-paper': {
        paddingTop: 10,
        paddingBottom: 10,
        width,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        overflow: 'hidden',
      },
    };
  },
);

const ExpandButton = styled(IconButton)({
  position: 'absolute',
  bottom: 20,
  right: 10,
});

let initialIsExpanded = false;

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
  const theme = useTheme();

  const location = useLocation();

  const [isExpanded, setIsExpanded] = React.useState(initialIsExpanded);

  const toggleExpanded = React.useCallback(() => {
    setIsExpanded((previousValue) => {
      initialIsExpanded = !previousValue;
      return !previousValue;
    });
  }, []);

  return (
    <Paper elevation={0} style={{ position: 'relative' }}>
      <Drawer variant="permanent" anchor="left" open={isExpanded}>
        <Toolbar variant="dense" />
        <List component="nav">
          {navigationOptions.map(({ name, path, icon }) => {
            const OptionIcon = icon;

            const isSelected = !!matchPath(`${path}/*`, location.pathname);

            return (
              <ListItem key={name} disablePadding>
                <Link to={path} style={{ textDecoration: 'none', width: '100%' }}>
                  <ListItemButton
                    selected={isSelected}
                    sx={{
                      border: 'none',
                      borderRadius: 0,
                      height: 40,
                      '&.Mui-selected': {
                        border: 'none',
                        borderRadius: 0,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ marginRight: '-10px' }}>
                      <OptionIcon color="primary" fontSize="medium" />
                    </ListItemIcon>
                    <ListItemText
                      primary={name}
                      primaryTypographyProps={{
                        fontWeight: 'medium',
                        variant: 'subtitle2',
                      }}
                    />
                  </ListItemButton>
                </Link>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      <ExpandButton
        onClick={toggleExpanded}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <ChevronLeftIcon
          color="primary"
          sx={{
            transition: 'transform linear 30ms',
            transform: `rotate(${isExpanded ? 0 : 180}deg)`,
          }}
        />
      </ExpandButton>
    </Paper>
  );
}
