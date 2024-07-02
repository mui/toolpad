import { createTheme } from '@mui/material/styles';

const defaultLightTheme = createTheme();

const baseLightTheme = createTheme(defaultLightTheme, {
  palette: {
    background: {
      default: defaultLightTheme.palette.grey['50'],
    },
  },
  typography: {
    h6: {
      fontWeight: '700',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderWidth: 0,
          borderBottomWidth: 1,
          borderStyle: 'solid',
          borderColor: defaultLightTheme.palette.divider,
          boxShadow: 'none',
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: defaultLightTheme.palette.primary.dark,
          padding: 8,
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          color: defaultLightTheme.palette.grey['600'],
          fontSize: 12,
          fontWeight: '700',
          height: 40,
          paddingLeft: 32,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          paddingTop: 0,
          paddingBottom: 0,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            '& .MuiListItemIcon-root': {
              color: defaultLightTheme.palette.primary.dark,
            },
            '& .MuiTypography-root': {
              color: defaultLightTheme.palette.primary.dark,
            },
            '& .MuiSvgIcon-root': {
              color: defaultLightTheme.palette.primary.dark,
            },
            '& .MuiTouchRipple-child': {
              backgroundColor: defaultLightTheme.palette.primary.dark,
            },
          },
          '& .MuiSvgIcon-root': {
            color: defaultLightTheme.palette.action.active,
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          '& .MuiTypography-root': {
            fontWeight: '500',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 34,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderBottomWidth: 2,
          marginLeft: '16px',
          marginRight: '16px',
        },
      },
    },
  },
});

export { baseLightTheme };
