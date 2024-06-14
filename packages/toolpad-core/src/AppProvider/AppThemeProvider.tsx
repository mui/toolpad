import * as React from 'react';
import {
  Experimental_CssVarsProvider as CssVarsProvider,
  getInitColorSchemeScript,
} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { AppProviderProps } from './AppProvider';

interface AppThemeProviderProps {
  children: React.ReactNode;
  theme: NonNullable<AppProviderProps['theme']>;
}

/**
 * @ignore - internal component.
 */
function AppThemeProvider(props: AppThemeProviderProps) {
  const { children, theme } = props;

  return (
    <React.Fragment>
      {getInitColorSchemeScript()}
      <CssVarsProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </CssVarsProvider>
    </React.Fragment>
  );
}

export { AppThemeProvider };
