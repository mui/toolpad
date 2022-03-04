import { ImportMap } from 'esinstall';
import importMap from '../public/web_modules/import-map.json';

function rewriteImports(map: ImportMap): ImportMap {
  return {
    ...map,
    imports: {
      ...Object.fromEntries(
        Object.entries(map.imports).map(([specifier, source]) => {
          const { pathname } = new URL(source, 'https://x/web_modules/');
          return [specifier, pathname];
        }),
      ),
    },
  };
}

const IMPORT_MAP = rewriteImports(importMap);

export default () => IMPORT_MAP;
