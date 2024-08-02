'use client';
import { extendTheme } from '@mui/material/styles';
import type {} from '@mui/material/themeCssVarsAugmentation';

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        background: {
          default: 'var(--mui-palette-grey-50)',
          defaultChannel: 'var(--mui-palette-grey-50)',
        },
      },
    },
    dark: {
      palette: {
        background: {
          default: 'var(--mui-palette-grey-900)',
          defaultChannel: 'var(--mui-palette-grey-900)',
        },
        text: {
          primary: 'var(--mui-palette-grey-200)',
          primaryChannel: 'var(--mui-palette-grey-200)',
        },
      },
    },
  },
  colorSchemeSelector: 'data-toolpad-color-scheme',
});

export default theme;
