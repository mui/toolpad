import { posix as path } from 'path';
import { deepmerge } from '@mui/utils';
import serializeJavascript from 'serialize-javascript';
import * as appDom from '../appDom';
import { RUNTIME_CONFIG_WINDOW_PROPERTY } from '../constants';
import { pathToNodeImportSpecifier } from '../utils/paths';

const INDEX_FILE_PATH = './index.tsx';
const THEME_FILE_PATH = './theme.ts';

interface GenerateCodeConfig {
  outDir?: string;
}

interface AppContext {
  themeFilePath: string;
  indexFilePath: string;
  getPageFilePath(pageNode: appDom.PageNode): string;
}

interface ModuleContextConstructorParams {
  appContext: AppContext;
  filePath: string;
}

class ModuleContext {
  filePath: string;

  appContext: AppContext;

  constructor({ appContext, filePath }: ModuleContextConstructorParams) {
    this.appContext = appContext;
    this.filePath = filePath;
  }
}

function generateIndexFile(ctx: ModuleContext, dom: appDom.AppDom): string {
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

function generateThemeFile(ctx: ModuleContext, dom: appDom.AppDom): string {
  const root = appDom.getApp(dom);
  const { themes = [] } = appDom.getChildNodes(dom, root);
  const themeNode = themes.length > 0 ? themes[0] : null;
  const toolpadTheme = deepmerge(
    {
      typography: {
        h1: {
          fontSize: `3.25rem`,
          fontWeight: 800,
        },

        h2: {
          fontSize: `2.25rem`,
          fontWeight: 700,
        },

        h3: {
          fontSize: `1.75rem`,
          fontWeight: 700,
        },

        h4: {
          fontSize: `1.5rem`,
          fontWeight: 700,
        },

        h5: {
          fontSize: `1.25rem`,
          fontWeight: 700,
        },

        h6: {
          fontSize: `1.15rem`,
          fontWeight: 700,
        },
      },
      fontFamilyMonospaced: 'Consolas, Menlo, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    },
    themeNode?.theme,
  );

  const code = `
    import { createTheme } from '@mui/material';
    export default createTheme(${serializeJavascript(toolpadTheme, { isJSON: true })});
  `;
  return code;
}

export function generateCode(
  dom: appDom.AppDom,
  config: GenerateCodeConfig = {},
): { files: Map<string, string> } {
  const { outDir = '/' } = config;

  const getPageFilePath = (pageNode: appDom.PageNode) =>
    path.join(outDir, `./pages/${pageNode.name}.tsx`);

  const appContext: AppContext = {
    indexFilePath: path.join(outDir, INDEX_FILE_PATH),
    themeFilePath: path.join(outDir, THEME_FILE_PATH),
    getPageFilePath,
  };

  const root = appDom.getApp(dom);
  const { pages = [] } = appDom.getChildNodes(dom, root);

  return {
    files: new Map([
      [
        appContext.indexFilePath,
        generateIndexFile(
          new ModuleContext({ appContext, filePath: appContext.indexFilePath }),
          dom,
        ),
      ],
      [
        appContext.themeFilePath,
        generateThemeFile(
          new ModuleContext({ appContext, filePath: appContext.themeFilePath }),
          dom,
        ),
      ],
      ...pages.map((page) => {
        return [
          getPageFilePath(page),
          `
            import * as React from 'react';

            export default function Page () {
              return <div>{${JSON.stringify(page.name)}}</div>
            }
          `,
        ] as [string, string];
      }),
    ]),
  };
}
