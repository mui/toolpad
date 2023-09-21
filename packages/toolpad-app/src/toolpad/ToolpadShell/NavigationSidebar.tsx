import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import ArticleIcon from '@mui/icons-material/Article';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import FunctionsIcon from '@mui/icons-material/Functions';
import {
  ListItem,
  ListItemButton,
  Paper,
  Toolbar,
  Drawer as MuiDrawer,
  List,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
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

const ExpandIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: 20,
  right: 10,
  zIndex: theme.zIndex.drawer + 1,
}));

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

  const [isExpanded, setIsExpanded] = React.useState(false);

  const toggleExpanded = React.useCallback(() => {
    setIsExpanded((previousValue) => !previousValue);
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
                <ListItemButton
                  component={Link}
                  to={path}
                  selected={isSelected}
                  sx={{
                    border: 'none',
                    borderRadius: 0,
                    borderLeft: `4px solid transparent`,
                    height: 40,
                    '&.Mui-selected': {
                      border: 'none',
                      borderRadius: 0,
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                    },
                  }}
                >
                  <ListItemIcon sx={{ marginLeft: '-2px', marginRight: '-10px' }}>
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
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      <ExpandIconButton color="primary" onClick={toggleExpanded}>
        <ChevronLeftIcon
          sx={{
            transition: 'transform linear 30ms',
            transform: `rotate(${isExpanded ? 0 : 180}deg)`,
          }}
        />
      </ExpandIconButton>
    </Paper>
  );
}
