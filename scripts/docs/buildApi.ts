import * as path from 'path';
import * as fs from 'fs/promises';
import { kebabCase } from 'lodash';
import type { ComponentConfig } from '@mui/toolpad-core';
import prettier from 'prettier';
import { escapeCell } from './utils';

async function writePrettifiedFile(filename: string, data: string, prettierConfigPath: string) {
  const prettierConfig = await prettier.resolveConfig(filename, {
    config: prettierConfigPath,
  });

  if (prettierConfig === null) {
    throw new Error(
      `Could not resolve config for '${filename}' using prettier config path '${prettierConfigPath}'.`,
    );
  }

  await fs.writeFile(filename, prettier.format(data, { ...prettierConfig, filepath: filename }), {
    encoding: 'utf8',
  });
}

const AUTO_GENERATED_WARNING = 'This file has been auto-generated using `yarn docs:build:api`.';

// Some dependencies of @mui/toolpad-components are not ESM. Bundlers can handle
// this transparently, but ts-node doesn't bundle. So we'll just use teh commonjs
// version of @mui/toolpad-components.
const builtins = require('@mui/toolpad-components');
const toolpadCore = require('@mui/toolpad-core');

const currentDirectory = __dirname;
const projectRoot = path.resolve(currentDirectory, '..', '..');
const prettierConfigPath = path.resolve(projectRoot, 'prettier.config.js');
const docsRoot = path.resolve(projectRoot, 'docs');
const componentDocsRoot = path.resolve(docsRoot, 'data/toolpad/components');
const componentPagesRoot = path.resolve(docsRoot, 'pages/toolpad/components');

async function writePageFile(mdFilePath: string) {
  const slug = path.basename(mdFilePath, '.md');
  const pageFilePath = path.resolve(componentPagesRoot, `${slug}.tsx`);
  const relativeMdPath = path.relative(componentPagesRoot, mdFilePath);
  await writePrettifiedFile(
    pageFilePath,
    `/* ${AUTO_GENERATED_WARNING} */

import * as React from 'react';
import MarkdownDocs from '@mui/monorepo/docs/src/modules/components/MarkdownDocs';
import * as pageProps from '${relativeMdPath}?@mui/markdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
`,
    prettierConfigPath,
  );
}

async function main() {
  await fs.rm(componentDocsRoot, { recursive: true, force: true });
  await fs.mkdir(componentDocsRoot, { recursive: true });
  await fs.rm(componentPagesRoot, { recursive: true, force: true });
  await fs.mkdir(componentPagesRoot, { recursive: true });

  const components = Object.entries(builtins).filter(([, binding]) =>
    toolpadCore.isToolpadComponent(binding),
  );

  await Promise.all(
    components.map(async ([name, binding]) => {
      if (toolpadCore.isToolpadComponent(binding)) {
        const slug = kebabCase(name);
        const config: ComponentConfig<any> = binding[toolpadCore.TOOLPAD_COMPONENT];

        let md = '';

        md += [
          `<!-- ${AUTO_GENERATED_WARNING} -->`,
          '',
          `# ${name}`,
          '',
          `<p class="description">API docs for the Toolpad ${name} component.</p>`,
          '',
          config.helperText,
          '',
          '## Properties',
          '',
          '| Name | Type | Default | Description |',
          '|:-----|:-----|:--------|:------------|',
          ...Object.entries(config.argTypes).map(([argName, argType]) => {
            const formattedName = `<span class="prop-name">${escapeCell(argName)}</span>`;
            const defaultValue = argType.default;
            const formattedType = `<span class="prop-type">${escapeCell(argType.type)}</span>`;

            const formattedDefaultValue =
              typeof defaultValue === 'undefined'
                ? ''
                : `<span class="prop-default">${escapeCell(JSON.stringify(defaultValue))}</span>`;

            return `| ${[
              formattedName,
              formattedType,
              formattedDefaultValue,
              escapeCell(argType.helperText || ''),
            ].join(' | ')} |`;
          }),
        ].join('\n');

        const mdFilePath = path.resolve(componentDocsRoot, `${slug}.md`);
        await writePrettifiedFile(mdFilePath, md, prettierConfigPath);

        await writePageFile(mdFilePath);
      }
    }),
  );

  const indexMd = [
    '# Index',
    '',
    `<p class="description">This page contains an index to the available components in Toolpad.</p>`,
    '',
    '## Components',
    '',
    ...components.map(([name]) => {
      return `- [${name}](/toolpad/components/${kebabCase(name)}/)`;
    }),
  ].join('\n');

  const indexMdFilePath = path.resolve(componentDocsRoot, `index.md`);
  await writePrettifiedFile(indexMdFilePath, indexMd, prettierConfigPath);
  await writePageFile(indexMdFilePath);

  const manifest = {
    '//': AUTO_GENERATED_WARNING,
    pages: [
      { pathname: '/toolpad/components', title: 'Index' },
      {
        pathname: '/toolpad/components/components-group',
        subheader: 'Components',
        children: components.map(([name]) => ({
          title: name,
          pathname: `/toolpad/components/${kebabCase(name)}`,
        })),
      },
    ],
  };

  const configJsonPath = path.resolve(componentDocsRoot, `manifest.json`);
  await writePrettifiedFile(configJsonPath, JSON.stringify(manifest, null, 2), prettierConfigPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
