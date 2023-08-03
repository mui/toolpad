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
  const defaultPage = pages[0];

  const themeImportSpecifier = pathToNodeImportSpecifier(
    path.relative(path.dirname(ctx.filePath), ctx.appContext.themeFilePath),
  );

  const code = `
    import * as React from 'react';
    import * as ReactDOM from 'react-dom/client';
    import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
    import { ThemeProvider, CssBaseline } from '@mui/material';
    import theme from ${JSON.stringify(themeImportSpecifier)}

    const config = window[${JSON.stringify(RUNTIME_CONFIG_WINDOW_PROPERTY)}];

    const base = process.env.BASE_URL;

    function Page({ name }) {
      return <div>Page {name}</div>;
    }

    function App() {
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          <BrowserRouter basename={base}>
            <Routes>
              ${pages.map((page) => {
                const pageUrlPath = `/pages/${page.id}`;
                return `<Route path=${JSON.stringify(
                  pageUrlPath,
                )} element={<Page name=${JSON.stringify(page.name)} />} />`;
              })}
              ${pages.map((page) => {
                const pageUrlPath = `/pages/${page.name}`;
                return `<Route path=${JSON.stringify(
                  pageUrlPath,
                )} element={<Navigate to=${JSON.stringify(`/pages/${page.id}`)} />} />`;
              })}
              <Route path="/" element={<Navigate to=${JSON.stringify(
                `/pages/${defaultPage.id}`,
              )} />} />
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
  const appContext: AppContext = {
    indexFilePath: path.join(outDir, INDEX_FILE_PATH),
    themeFilePath: path.join(outDir, THEME_FILE_PATH),
  };
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
    ]),
  };
}
