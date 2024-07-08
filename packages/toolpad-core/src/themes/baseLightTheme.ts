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
});

export { baseLightTheme };
