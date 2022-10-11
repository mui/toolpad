import { chromeDark, chromeLight, InspectorTheme } from 'react-inspector';

function getInspectorTheme(mode: 'dark' | 'light'): InspectorTheme {
  return {
    ...(mode === 'dark' ? chromeDark : chromeLight),
    BASE_BACKGROUND_COLOR: 'inherit',
    TREENODE_FONT_FAMILY: 'inherit',
    TREENODE_FONT_SIZE: 'inherit',
    ARROW_FONT_SIZE: 'inherit',
    TREENODE_LINE_HEIGHT: 'inherit',
  };
}

export default getInspectorTheme;
