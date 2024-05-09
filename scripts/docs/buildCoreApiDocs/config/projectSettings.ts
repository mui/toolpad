import path from 'path';
import { LANGUAGES } from 'docs/config';
import { ProjectSettings } from '@mui-internal/api-docs-builder';
import findApiPages from '@mui-internal/api-docs-builder/utils/findApiPages';
import { getCoreComponentInfo } from './getCoreComponentInfo';
import { getCoreHookInfo } from './getCoreHookInfo';
import { generateCoreApiPages } from './generateCoreApiPages';
import { generateApiLinks } from './generateApiLinks';
import { getComponentImports } from './getComponentImports';

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
  getHookInfo: getCoreHookInfo,
  getHookImports: getComponentImports,
  translationLanguages: LANGUAGES,
  skipComponent: () => false,
  onCompleted: async () => {
    await generateCoreApiPages();
  },
  onWritingManifestFile(builds, source) {
    const apiLinks = generateApiLinks(builds);
    if (apiLinks.length > 0) {
      return `module.exports = ${JSON.stringify(apiLinks)}`;
    }

    return source;
  },
  skipAnnotatingComponentDefinition: true,
  skipSlotsAndClasses: true,
  generateJsonFileOnly: true,
  translationPagesDirectory: 'docs/translations/api-docs',
  generateClassName: () => '',
  isGlobalClassName: () => false,
};
