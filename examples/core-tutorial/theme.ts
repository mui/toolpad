'use client';
import { createTheme } from '@mui/material/styles';

const defaultTheme = createTheme();

const theme = createTheme(defaultTheme, {
  palette: {
    background: {
      default: defaultTheme.palette.grey['50'],
    },
  },
});

export default theme;
