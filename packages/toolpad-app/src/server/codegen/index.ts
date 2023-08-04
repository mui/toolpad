import { posix as path } from 'path';
import * as appDom from '../../appDom';
import generateThemeFile from './generateThemeFile';
import generateAppFile from './generateAppFile';
import generatePageFile from './generatePageFile';

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

export class ModuleContext {
  filePath: string;

  appContext: AppContext;

  constructor({ appContext, filePath }: ModuleContextConstructorParams) {
    this.appContext = appContext;
    this.filePath = filePath;
  }
}

export function generateAppCode(
  dom: appDom.AppDom,
  config: GenerateCodeConfig = {},
): { files: Map<string, string> } {
  const { outDir = '/' } = config;

  const appContext: AppContext = {
    indexFilePath: path.join(outDir, INDEX_FILE_PATH),
    themeFilePath: path.join(outDir, THEME_FILE_PATH),
    getPageFilePath: (pageNode: appDom.PageNode) =>
      path.join(outDir, `./pages/${pageNode.name}.tsx`),
  };

  const root = appDom.getApp(dom);
  const { pages = [] } = appDom.getChildNodes(dom, root);

  return {
    files: new Map([
      [
        appContext.indexFilePath,
        generateAppFile(new ModuleContext({ appContext, filePath: appContext.indexFilePath }), dom),
      ],
      [
        appContext.themeFilePath,
        generateThemeFile(
          new ModuleContext({ appContext, filePath: appContext.themeFilePath }),
          dom,
        ),
      ],
      ...pages.map<[string, string]>((page) => {
        const pageFilePath = appContext.getPageFilePath(page);
        return [
          pageFilePath,
          generatePageFile(new ModuleContext({ appContext, filePath: pageFilePath }), page),
        ];
      }),
    ]),
  };
}
