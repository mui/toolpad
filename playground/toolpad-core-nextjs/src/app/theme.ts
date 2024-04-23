'use client';

import { createTheme } from '@mui/material/styles';

const baseTheme = createTheme();

const theme = createTheme(baseTheme, {
  palette: {
    background: {
      default: baseTheme.palette.grey['50'],
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
          borderColor: baseTheme.palette.divider,
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
          color: baseTheme.palette.primary.dark,
          padding: 8,
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          color: baseTheme.palette.grey['600'],
          fontSize: 12,
          fontWeight: '700',
          height: 40,
          paddingLeft: 32,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '&.Mui-selected': {
            '& .MuiListItemIcon-root': {
              color: baseTheme.palette.primary.dark,
            },
            '& .MuiTypography-root': {
              color: baseTheme.palette.primary.dark,
            },
            '& .MuiSvgIcon-root': {
              color: baseTheme.palette.primary.dark,
            },
            '& .MuiTouchRipple-child': {
              backgroundColor: baseTheme.palette.primary.dark,
            },
          },
          '& .MuiSvgIcon-root': {
            color: baseTheme.palette.action.active,
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
          minWidth: '34px',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderBottomWidth: 2,
          margin: '8px 16px 0',
        },
      },
    },
  },
});

export default theme;
