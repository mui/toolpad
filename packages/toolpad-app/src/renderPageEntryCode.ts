export interface RenderEntryPointParams {
  editor?: boolean;
  pagePath: string;
  themePath: string;
}

export const APP_ROOT_ID = 'root';

export default function renderEntryPoint({ pagePath, themePath }: RenderEntryPointParams) {
  const pagePathString = JSON.stringify(pagePath);
  const themePathString = JSON.stringify(themePath);
  const code = `
    import * as React from 'react';
    import { createRoot } from 'react-dom/client';
    import { ThemeProvider, createTheme } from '@mui/material/styles';
    import { CssBaseline } from '@mui/material';
    import { QueryClient, QueryClientProvider } from 'react-query'
    import Page from ${pagePathString};
    import theme from ${themePathString};
    
    const queryClient = new QueryClient();
    
    function render (root, Page, theme) {
      const appTheme = createTheme(theme);
      root.render(
        <QueryClientProvider client={queryClient}>
          <CssBaseline />
          <ThemeProvider theme={appTheme}>
            <Page />
          </ThemeProvider>
        </QueryClientProvider>
      );
    }
    
    // Poor man's refresh implementation
    // TODO: react-refresh implementation, move to worker
    if (import.meta.hot) {
      // Make sure to reuse the root
      const root = import.meta.hot.data.root || createRoot(document.getElementById(${JSON.stringify(
        APP_ROOT_ID,
      )}));
      
      if (!import.meta.hot.data.isRefresh) {
        render(root, Page, theme);
      }
    
      import.meta.hot.accept([${pagePathString}, ${themePathString}], ({ module, deps }) => {
        const [{ default: Page }, { default: theme }] = deps 
        render(root, Page, theme);
      });
    
      import.meta.hot.dispose(() => {
        import.meta.hot.data.isRefresh = true;
        import.meta.hot.data.root = root;
      });
    } else {
      const root = createRoot(document.getElementById(${JSON.stringify(APP_ROOT_ID)}));
      render(root, Page, theme);
    }
  `;

  return { code };
}
