import { Theme } from '@mui/material';

const getMonacoEditorTheme = (theme: Theme): string =>
  theme.palette.mode === 'dark' ? 'vs-dark' : 'vs';

export default getMonacoEditorTheme;
