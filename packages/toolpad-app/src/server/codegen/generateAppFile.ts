import { posix as path } from 'path';
import * as appDom from '../../appDom';
import { RUNTIME_CONFIG_WINDOW_PROPERTY } from '../../constants';
import { pathToNodeImportSpecifier } from '../../utils/paths';
import type { ModuleContext } from '.';

export default function generateAppFile(ctx: ModuleContext, dom: appDom.AppDom): string {
  const { pages = [] } = appDom.getChildNodes(dom, appDom.getApp(dom));
  const defaultPage: appDom.PageNode | undefined = pages[0];

  const themeImportSpecifier = pathToNodeImportSpecifier(
    path.relative(path.dirname(ctx.filePath), ctx.appContext.themeFilePath),
  );

  const getPageComponentName = (page: appDom.PageNode) => `Page_${page.name}`;

  const defaultPageUrl = defaultPage ? `/pages/${defaultPage.id}` : null;

  const code = `
    import * as React from 'react';
    import * as ReactDOM from 'react-dom/client';
    import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
    import { ThemeProvider, CssBaseline, Container, Typography } from '@mui/material';
    import theme from ${JSON.stringify(themeImportSpecifier)};
    ${pages
      .map((page) => {
        const pageImportSpecifier = pathToNodeImportSpecifier(
          path.relative(path.dirname(ctx.filePath), ctx.appContext.getPageFilePath(page)),
        );
        return `import ${getPageComponentName(page)} from ${JSON.stringify(pageImportSpecifier)};`;
      })
      .join('\n')}

    const config = window[${JSON.stringify(RUNTIME_CONFIG_WINDOW_PROPERTY)}];

    const base = process.env.BASE_URL;

    function PageNotFound() {
      return (
        <Container
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h1">Not found</Typography>
          <Typography>The page doesn&apos;t exist in this application.</Typography>
        </Container>
      );
    }

    function App() {
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          <BrowserRouter basename={base}>
            <Routes>
              ${pages.map((page) => {
                const pageUrlPath = `/pages/${page.id}`;
                const pageElement = `<${getPageComponentName(page)} />`;
                return `<Route path=${JSON.stringify(pageUrlPath)} element={${pageElement}} />`;
              })}
              ${pages.map((page) => {
                const pageUrlPath = `/pages/${page.name}`;
                const pageRedirectUrlPath = `/pages/${page.id}`;
                const pageElement = `<Navigate to=${JSON.stringify(pageRedirectUrlPath)} />`;
                return `<Route path=${JSON.stringify(pageUrlPath)} element={${pageElement}} />`;
              })}
              ${
                defaultPageUrl
                  ? `<Route path="/" element={<Navigate to=${JSON.stringify(defaultPageUrl)} />} />`
                  : ''
              }
              <Route path="*" element={<PageNotFound />} />
            </Routes>
            <pre>{${JSON.stringify(JSON.stringify(dom, null, 2))}}</pre>
          </BrowserRouter>
        </ThemeProvider>
      );
    }

    const container: HTMLElement = document.getElementById('root')
    ReactDOM.createRoot(container).render(<App />);
  `;
  return code;
}
