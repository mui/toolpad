import { createTheme } from '@mui/material/styles';

const defaultTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export const baseThemeDark = createTheme(defaultTheme, {
  palette: {
    background: {
      default: defaultTheme.palette.grey['900'],
    },
    text: {
      primary: defaultTheme.palette.grey['100'],
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
          backgroundColor: defaultTheme.palette.background.default,
          borderWidth: 0,
          borderBottomWidth: 1,
          borderStyle: 'solid',
          borderColor: defaultTheme.palette.divider,
          boxShadow: 'none',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          backgroundColor: 'inherit',
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
          color: defaultTheme.palette.primary.dark,
          padding: 8,
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          color: defaultTheme.palette.grey['500'],
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
              color: defaultTheme.palette.primary.dark,
            },
            '& .MuiTypography-root': {
              color: defaultTheme.palette.primary.dark,
            },
            '& .MuiSvgIcon-root': {
              color: defaultTheme.palette.primary.dark,
            },
            '& .MuiTouchRipple-child': {
              backgroundColor: defaultTheme.palette.primary.dark,
            },
          },
          '& .MuiSvgIcon-root': {
            color: defaultTheme.palette.grey['100'],
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
