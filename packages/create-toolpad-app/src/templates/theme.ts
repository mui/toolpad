const theme: TemplateFile = {
  content: `
  "use client";
  import { createTheme } from '@mui/material/styles';
  const lightTheme = createTheme();
  
  const darkTheme = createTheme({ palette: { mode: 'dark' } });
  const theme = {
    light: lightTheme,
    dark: darkTheme
  };

  export default theme;
  `,
};

export default theme;
