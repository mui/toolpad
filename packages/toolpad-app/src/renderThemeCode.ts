import * as appDom from './appDom';
import { tryFormat } from './utils/prettier';

export interface RenderThemeConfig {
  // whether we're in the context of an editor
  editor: boolean;
  // prettify output
  pretty: boolean;
}

export default function renderThemeCode(
  dom: appDom.AppDom,
  configInit: Partial<RenderThemeConfig> = {},
) {
  const config: RenderThemeConfig = {
    editor: false,
    pretty: false,
    ...configInit,
  };

  let code = `
  export default {};
  `;

  const app = appDom.getApp(dom);
  const { themes = [] } = appDom.getChildNodes(dom, app);

  if (themes.length > 0) {
    const theme = themes[0];
    const importedColors = new Set();
    const paletteProps: [string, string][] = [];

    const primary = appDom.fromConstPropValue(theme.theme['palette.primary.main']);
    if (primary) {
      importedColors.add(primary);
      paletteProps.push(['primary', `{ main: ${primary}[500] }`]);
    }

    const secondary = appDom.fromConstPropValue(theme.theme['palette.secondary.main']);
    if (secondary) {
      importedColors.add(secondary);
      paletteProps.push(['secondary', `{ main: ${secondary}[500] }`]);
    }
    const palette =
      paletteProps.length > 0
        ? `{ ${paletteProps.map((entry) => entry.join(': ')).join(', \n')} }`
        : null;
    code = `
    ${
      importedColors.size > 0
        ? `import { ${Array.from(importedColors).join(', ')} } from '@mui/material/colors'`
        : ''
    }    

    export default {
      ${palette ? `palette: ${palette}` : ''}
    };
    `;
  }

  if (config.pretty) {
    code = tryFormat(code);
  }

  return { code };
}
