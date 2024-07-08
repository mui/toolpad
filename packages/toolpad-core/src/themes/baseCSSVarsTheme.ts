import { experimental_extendTheme as extendTheme } from '@mui/material/styles';
import type {} from '@mui/material/themeCssVarsAugmentation';

const baseCSSVarsTheme = extendTheme({
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
  typography: {
    h6: {
      fontWeight: '700',
    },
  },
});

export { baseCSSVarsTheme };
