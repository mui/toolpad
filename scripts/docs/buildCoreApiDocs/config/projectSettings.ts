import path from 'path';
import { ProjectSettings } from '@mui-internal/api-docs-builder';
import findApiPages from '@mui-internal/api-docs-builder/utils/findApiPages';
import { LANGUAGES } from '../../../../docs/config';
import { getCoreComponentInfo } from './getCoreComponentInfo';
import { getComponentImports } from './getComponentImports';

const repositoryRoot = path.resolve(__dirname, '../../../..');

export const projectSettings: ProjectSettings = {
  output: {
    apiManifestPath: path.join(process.cwd(), 'docs/data/toolpad/core/pagesApi.js'),
  },
  typeScriptProjects: [
    {
      name: 'toolpad-core',
      rootPath: path.join(process.cwd(), 'packages/toolpad-core'),
      entryPointPath: 'src/index.ts',
    },
  ],
  getApiPages: () => findApiPages('docs/pages/toolpad/core/api'),
  getComponentInfo: getCoreComponentInfo,
  getComponentImports,
  translationLanguages: LANGUAGES,
  skipComponent: (filename: string) => {
    const relativePath = path.relative(repositoryRoot, filename);
    const directories = path.dirname(relativePath).split(path.sep);

    return directories[3] === 'nextjs';
  },
  skipSlotsAndClasses: true,
  translationPagesDirectory: 'docs/translations/api-docs',
  importTranslationPagesDirectory: 'docs-toolpad/translations/api-docs',
  generateClassName: () => '',
  isGlobalClassName: () => false,
};
