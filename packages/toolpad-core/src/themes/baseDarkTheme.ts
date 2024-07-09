import { createTheme } from '@mui/material/styles';

const defaultDarkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const baseDarkTheme = createTheme(defaultDarkTheme, {
  palette: {
    background: {
      default: defaultDarkTheme.palette.grey['900'],
    },
    text: {
      primary: defaultDarkTheme.palette.grey['100'],
    },
  },
});

export { baseDarkTheme };
