import fs from 'fs';
import path from 'path';
import { getHeaders, getTitle } from '@mui/internal-markdown';
import {
  ComponentInfo,
  extractPackageFile,
  getApiPath,
  parseFile,
  fixPathname,
} from '@mui-internal/api-docs-builder/buildApiUtils';
import findPagesMarkdown from '@mui-internal/api-docs-builder/utils/findPagesMarkdown';

const REPO_ROOT = path.resolve(__dirname, '../../../..');

export function getCoreDemos(name: string) {
  // resolve demos, so that we can getch the API url
  const allMarkdowns = findPagesMarkdown(path.join(REPO_ROOT, 'docs/data/toolpad'))
    .filter((markdown) => {
      return markdown.filename.match(/[\\/]data[\\/]toolpad[\\/]core[\\/]/);
    })
    .map((markdown) => {
      const markdownContent = fs.readFileSync(markdown.filename, 'utf8');
      const markdownHeaders = getHeaders(markdownContent) as any;

      return {
        ...markdown,
        markdownContent,
        components: markdownHeaders.components as string[],
      };
    });
  return allMarkdowns
    .filter((page) => page.components.includes(name))
    .map((page) => ({
      demoPageTitle: getTitle(page.markdownContent),
      demoPathname: fixPathname(page.pathname),
    }));
}

export function getCoreComponentInfo(filename: string): ComponentInfo {
  const { name } = extractPackageFile(filename);
  let srcInfo: null | ReturnType<ComponentInfo['readFile']> = null;
  if (!name) {
    throw new Error(`Could not find the component name from: ${filename}`);
  }

  const demos = getCoreDemos(name);
  const apiPath = getApiPath(demos, name) || '';

  return {
    filename,
    name,
    muiName: name,
    apiPathname: apiPath,
    apiPagesDirectory: path.join(process.cwd(), `docs/pages/toolpad/core/api`),
    isSystemComponent: false,
    readFile: () => {
      srcInfo = parseFile(filename);
      return srcInfo;
    },
    getInheritance: () => {
      return null;
    },
    getDemos: () => demos,
  };
}
