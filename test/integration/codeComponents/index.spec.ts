import * as path from 'path';
import * as fs from 'fs/promises';
import * as url from 'url';
import invariant from 'invariant';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { expect, test } from '../../playwright/localTest';
import { ToolpadEditor } from '../../models/ToolpadEditor';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture'),
  },
  localAppConfig: {
    cmd: 'dev',
  },
});

test('custom components can use external libraries', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.goToPage('page');

  const test1 = page.getByText('Page D');
  await expect(test1).toBeVisible();
});

test('can create new custom components', async ({ page, localApp }) => {
  invariant(
    localApp,
    'test must be configured with `localAppConfig`. Add `test.use({ localAppConfig: ... })`',
  );

  const editorModel = new ToolpadEditor(page);

  await editorModel.goto();

  await editorModel.waitForOverlay();

  const newComponentPath = path.resolve(localApp.dir, './toolpad/components/MyInspector.tsx');
  await fs.writeFile(
    newComponentPath,
    `import * as React from 'react';
import { createComponent } from '@toolpad/studio/browser';
import { Inspector } from 'react-inspector';

interface MyInspectorProps {
  data: any;
}

function MyInspector({ data }: MyInspectorProps) {
  return <Inspector data={data} />;
}

export default createComponent(MyInspector, {
  argTypes: {
    data: { type: 'object' },
  },
});
    `,
    { encoding: 'utf-8' },
  );

  // vite causes a reload when we're creating new custom components
  // See https://github.com/vitejs/vite/issues/12912
  await page.locator('[data-testid="page-ready-marker"]').isHidden();
  await editorModel.waitForOverlay();

  await editorModel.componentCatalog.hover();
  await expect(editorModel.getComponentCatalogItem('MyInspector')).toBeVisible();

  await editorModel.dragNewComponentToCanvas('MyInspector');

  await editorModel.componentEditor.getByRole('button', { name: 'data' }).click();

  const jsonEditorDialog = page.getByRole('dialog', { name: 'edit json' });
  const jsonEditor = jsonEditorDialog.locator('.monaco-editor');
  await jsonEditor.click();
  await page.keyboard.type('{ "content": "Hello everyone!" }');
  await jsonEditorDialog.getByRole('button', { name: 'save' }).click();

  await expect(editorModel.appCanvas.getByText('Hello everyone!')).toBeVisible();
});

test('Can handle default values for controlled props', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.goToPage('page1');

  const test1 = page.getByText('Output: Hello world!');
  await expect(test1).toBeVisible();
});
