export interface RenderEntryPointParams {
  editor?: boolean;
  pagePath: string;
  themePath: string;
}

export default function renderEntryPoint({ pagePath, themePath }: RenderEntryPointParams) {
  const pagePathString = JSON.stringify(pagePath);
  const themePathString = JSON.stringify(themePath);
  const code = `
    import * as React from 'react';
    import * as ReactDOM from 'react-dom';
    import { ThemeProvider, createTheme } from '@mui/material/styles';
    import { CssBaseline } from '@mui/material';
    import { QueryClient, QueryClientProvider } from 'react-query'
    import Page from ${pagePathString};
    import theme from ${themePathString};
    
    const queryClient = new QueryClient();
    
    function render (Page, theme) {
      const appTheme = createTheme(theme);
      ReactDOM.render(
        <QueryClientProvider client={queryClient}>
          <CssBaseline />
          <ThemeProvider theme={appTheme}>
            <Page />
          </ThemeProvider>
        </QueryClientProvider>, 
        document.getElementById('root')
      );
    }
    
    // Poor man's refresh implementation
    // TODO: react-refresh implementation, move to worker
    if (import.meta.hot) {
      if (!import.meta.hot.data.isRefresh) {
        render(Page, theme);
      }
    
      import.meta.hot.accept([${pagePathString}, ${themePathString}], ({ module, deps }) => {
        const [{ default: Page }, { default: theme }] = deps 
        render(Page, theme);
      });
    
      import.meta.hot.dispose(() => {
        import.meta.hot.data.isRefresh = true;
      });
    } else {
      render(Page, theme);
    }
  `;

  return { code };
}
