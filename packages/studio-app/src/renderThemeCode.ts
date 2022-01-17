import * as prettier from 'prettier';
import parserBabel from 'prettier/parser-babel';
import * as studioDom from './studioDom';

export interface RenderThemeConfig {
  // whether we're in the context of an editor
  editor: boolean;
  // prettify output
  pretty: boolean;
}

export default function renderThemeCode(
  dom: studioDom.StudioDom,
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

  const app = studioDom.getApp(dom);
  const theme = studioDom.getTheme(dom, app);

  if (theme) {
    const importedColors = new Set();
    const paletteProps: [string, string][] = [];
    const primary = studioDom.getConstPropValue(theme, 'palette.primary.main');
    if (primary) {
      importedColors.add(primary);
      paletteProps.push(['primary', `{ main: ${primary}[500] }`]);
    }
    const secondary = studioDom.getConstPropValue(theme, 'palette.secondary.main');
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
    code = prettier.format(code, {
      parser: 'babel-ts',
      plugins: [parserBabel],
    });
  }

  return { code };
}
