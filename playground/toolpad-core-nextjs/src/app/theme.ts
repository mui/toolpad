'use client';

import { Inter } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

const inter = Inter({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const baseTheme = createTheme({
  palette: {
    grey: {
      50: 'rgba(19, 35, 70, 0.05)',
      100: 'rgba(19, 35, 70, 0.1)',
      200: 'rgba(19, 35, 70, 0.2)',
      300: 'rgba(19, 35, 70, 0.3)',
      400: 'rgba(19, 35, 70, 0.4)',
      500: 'rgba(19, 35, 70, 0.5)',
      600: 'rgba(19, 35, 70, 0.6)',
      700: 'rgba(19, 35, 70, 0.7)',
      800: 'rgba(19, 35, 70, 0.8)',
      900: 'rgba(19, 35, 70, 0.9)',
    },
    divider: 'rgba(19, 35, 70, 0.12)',
    background: {
      default: '#fbfcfe',
    },
    action: {
      active: 'rgba(19, 35, 70, 0.28)',
      hover: 'rgba(19, 35, 70, 0.04)',
      hoverOpacity: 0.04,
      selected: 'rgba(66, 165, 245, 0.15)',
      selectedOpacity: 0.15,
      disabled: 'rgba(19, 35, 70, 0.2)',
      disabledBackground: 'rgba(19, 35, 70, 0.12)',
      disabledOpacity: 0.38,
      focus: 'rgba(19, 35, 70, 0.12)',
      focusOpacity: 0.12,
      activatedOpacity: 0.12,
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
  },
});

const theme = createTheme(baseTheme, {
  typography: {
    h6: {
      fontWeight: '700',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${baseTheme.palette.divider}`,
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
          color: baseTheme.palette.grey['400'],
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
          border: '1px solid rgba(0, 0, 0, 0)',
          borderRadius: '8px',
          '&.Mui-selected': {
            border: '1px solid rgba(66, 165, 245, 0.3)',
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
          borderBottomWidth: 4,
          borderColor: baseTheme.palette.grey['50'],
          margin: '8px 16px 0',
        },
      },
    },
  },
});

export default theme;
