import { useTheme } from '@mui/material/styles';

const useMonacoTheme = (): string => {
  const theme = useTheme();
  return theme.palette.mode === 'dark' ? 'vs-dark' : 'vs';
};

export default useMonacoTheme;
