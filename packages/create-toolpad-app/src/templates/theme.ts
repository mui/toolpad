const theme = `
  "use client";
  import { createTheme } from '@mui/material/styles';

  const theme = createTheme({
    colorSchemes: { light: true, dark: true },
    colorSchemeSelector: 'data-toolpad-color-scheme',
  });

  export default theme;
  `;

export default theme;
