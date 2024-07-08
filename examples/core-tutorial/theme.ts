'use client';
import { createTheme } from '@mui/material/styles';

const defaultTheme = createTheme();

const theme = createTheme(defaultTheme, {
  palette: {
    background: {
      default: defaultTheme.palette.grey['50'],
    },
  },
  typography: {
    h6: {
      fontWeight: '700',
    },
  },
});

export default theme;
