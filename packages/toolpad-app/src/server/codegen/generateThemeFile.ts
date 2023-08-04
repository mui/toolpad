import { deepmerge } from '@mui/utils';
import serializeJavascript from 'serialize-javascript';
import * as appDom from '../../appDom';
import type { ModuleContext } from '.';

export default function generateThemeFile(ctx: ModuleContext, dom: appDom.AppDom): string {
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
