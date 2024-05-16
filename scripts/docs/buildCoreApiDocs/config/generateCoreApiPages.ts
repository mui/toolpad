import fs from 'fs';
import path from 'path';
import findPagesMarkdown from '@mui-internal/api-docs-builder/utils/findPagesMarkdown';
import { writePrettifiedFile } from '@mui-internal/api-docs-builder/buildApiUtils';

const REPO_ROOT = path.resolve(__dirname, '../../../..');

export async function generateCoreApiPages() {
  await Promise.all(
    findPagesMarkdown(path.join(REPO_ROOT, 'docs/data')).map(async (markdown) => {
      const pathnameTokens = markdown.pathname.split('/');
      const productName = pathnameTokens[1];
      const subProductName = pathnameTokens[2];
      const componentName = pathnameTokens[4];

      // TODO: fix `productName` should be called `productId` and include the full name,
      // for example toolpad-core below.
      if (
        productName === 'toolpad' &&
        subProductName === 'core' &&
        (markdown.filename.indexOf('\\components\\') >= 0 ||
          (markdown.filename.indexOf('/components/') >= 0 && !!componentName))
      ) {
        const tokens = markdown.pathname.split('/');
        const name = tokens[tokens.length - 1];
        const importStatement = `docs-toolpad/data${markdown.pathname}/${name}.md`;
        const demosSource = `
import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocs';
import * as pageProps from '${importStatement}?muiMarkdown';

export default function Page() {
  return <MarkdownDocs disableAd {...pageProps} />;
}
      `;

        const componentPageDirectory = `docs/pages/${productName}/core/${componentName}/`;
        if (!fs.existsSync(componentPageDirectory)) {
          fs.mkdirSync(componentPageDirectory, { recursive: true });
        }
        await writePrettifiedFile(
          path.join(process.cwd(), `${componentPageDirectory}/index.js`),
          demosSource,
        );
      }
    }),
  );
}
