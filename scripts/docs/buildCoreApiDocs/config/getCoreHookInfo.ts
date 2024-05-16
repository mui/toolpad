import fs from 'fs';
import path from 'path';
import kebabCase from 'lodash/kebabCase';
import { getHeaders, getTitle } from '@mui/internal-markdown';
import {
  ComponentInfo,
  HookInfo,
  extractPackageFile,
  fixPathname,
  getApiPath,
  parseFile,
} from '@mui-internal/api-docs-builder/buildApiUtils';
import findPagesMarkdown from '@mui-internal/api-docs-builder/utils/findPagesMarkdown';

const REPO_ROOT = path.resolve(__dirname, '../../../..');

export function getCoreHookInfo(filename: string): HookInfo {
  const { name } = extractPackageFile(filename);
  let srcInfo: null | ReturnType<ComponentInfo['readFile']> = null;
  if (!name) {
    throw new Error(`Could not find the hook name from: ${filename}`);
  }

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
        hooks: markdownHeaders.hooks as string[],
      };
    });

  const demos = findCoreHooksDemos(name, allMarkdowns);
  const apiPath = getApiPath(demos, name);

  return {
    filename,
    name,
    apiPathname: apiPath ?? `/toolpad/core/api/${kebabCase(name)}/`,
    apiPagesDirectory: path.join(process.cwd(), `docs/pages/toolpad/core/api`),
    readFile: () => {
      srcInfo = parseFile(filename);
      return srcInfo;
    },
    getDemos: () => demos,
  };
}

function findCoreHooksDemos(
  hookName: string,
  pagesMarkdown: ReadonlyArray<{
    pathname: string;
    hooks: readonly string[];
    markdownContent: string;
  }>,
) {
  return pagesMarkdown
    .filter((page) => page.hooks && page.hooks.includes(hookName))
    .map((page) => ({
      demoPageTitle: getTitle(page.markdownContent),
      demoPathname: fixPathname(page.pathname),
    }));
}
