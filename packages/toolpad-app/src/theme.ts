import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';
import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import type {} from '@mui/lab/themeAugmentation';

// Create a theme instance.
const theme = createTheme({
  components: {
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiButton: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiIconButton: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiCheckbox: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiToggleButtonGroup: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiAutocomplete: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiToolbar: {
      defaultProps: {
        variant: 'dense',
      },
    },
    MuiList: {
      defaultProps: {
        dense: true,
      },
    },
    MuiDataGrid: {
      defaultProps: {
        density: 'compact',
      },
    },
    MuiSvgIcon: {
      defaultProps: {
        fontSize: 'small',
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 0,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          padding: 8,
          minHeight: 0,
        },
      },
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
  },
});

export default theme;
