import path from 'path';
import { LANGUAGES } from 'docs/config';
import { ProjectSettings } from '@mui-internal/api-docs-builder';
import findApiPages from '@mui-internal/api-docs-builder/utils/findApiPages';
import { getCoreComponentInfo } from './getCoreComponentInfo';

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
  translationLanguages: LANGUAGES,
  skipComponent: () => false,
  skipSlotsAndClasses: true,
  translationPagesDirectory: 'docs/translations/api-docs',
  generateClassName: () => '',
  isGlobalClassName: () => false,
};
