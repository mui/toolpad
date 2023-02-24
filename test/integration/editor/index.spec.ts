import * as path from 'path';
import * as readline from 'readline';
import * as fs from 'fs/promises';
import childProcess from 'child_process';
import { Readable } from 'stream';
import { test, expect } from '../../playwright/test';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import clickCenter from '../../utils/clickCenter';
import { APP_ID_LOCAL_MARKER } from '../../../packages/toolpad-app/src/constants';

const DEV_MODE = false;
const VERBOSE = true;

async function waitForMatch(input: Readable, regex: RegExp): Promise<RegExpExecArray | null> {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({ input });

    rl.on('line', (line) => {
      const match = regex.exec(line);
      if (match) {
        rl.close();
        resolve(match);
      }
    });
    rl.on('error', (err) => reject(err));
    rl.on('end', () => resolve(null));
  });
}

interface WithAppOptions {
  cmd?: 'start' | 'dev';
  template?: string;
}

async function withApp(options: WithAppOptions, doWork: (url: string) => Promise<void>) {
  const { cmd = 'start', template } = options;

  const projectDir = await fs.mkdtemp(path.resolve(__dirname, './tmp-'));

  try {
    if (template) {
      await fs.cp(template, projectDir, { recursive: true });
    }

    const child = childProcess.exec(`toolpad ${cmd} --port 3000 ${DEV_MODE ? '--dev' : ''}`, {
      cwd: projectDir,
    });

    try {
      await Promise.race([
        new Promise((resolve, reject) => {
          child.on('exit', (code) => {
            reject(new Error(`App process exited unexpectedly${code ? ` with code ${code}` : ''}`));
          });
        }),
        (async () => {
          if (!child.stdout) {
            throw new Error('No stdout');
          }

          if (VERBOSE) {
            child.stdout?.pipe(process.stdout);
          }

          const match = await waitForMatch(child.stdout, /localhost:(\d+)/);

          if (!match) {
            throw new Error('Failed to start');
          }

          const port = Number(match[1]);
          await doWork(`http://localhost:${port}`);
        })(),
      ]);
    } finally {
      child.kill();
    }
  } finally {
    await fs.rm(projectDir, { recursive: true });
  }
}

test('can place new components from catalog', async ({ page }) => {
  await withApp(
    {
      cmd: 'dev',
    },
    async () => {
      const editorModel = new ToolpadEditor(page);

      await editorModel.goto(APP_ID_LOCAL_MARKER);

      await editorModel.pageRoot.waitFor();

      const canvasInputLocator = editorModel.appCanvas.locator('input');

      await expect(canvasInputLocator).toHaveCount(0);

      const TEXT_FIELD_COMPONENT_DISPLAY_NAME = 'Text field';

      // Drag in a first component

      await editorModel.dragNewComponentToAppCanvas(TEXT_FIELD_COMPONENT_DISPLAY_NAME);

      await expect(canvasInputLocator).toHaveCount(1);
      await expect(canvasInputLocator).toBeVisible();

      // Drag in a second component

      await editorModel.dragNewComponentToAppCanvas(TEXT_FIELD_COMPONENT_DISPLAY_NAME);

      await expect(canvasInputLocator).toHaveCount(2);
    },
  );
});

test('can move elements in page', async ({ page }) => {
  test.setTimeout(15000);
  await withApp(
    {
      template: path.resolve(__dirname, './fixture'),
      cmd: 'dev',
    },
    async () => {
      const editorModel = new ToolpadEditor(page);
      const TEXT_FIELD_COMPONENT_DISPLAY_NAME = 'Text field';

      await editorModel.goto(APP_ID_LOCAL_MARKER);

      await editorModel.waitForOverlay();

      const canvasMoveElementHandleSelector = `:has-text("${TEXT_FIELD_COMPONENT_DISPLAY_NAME}")[draggable]`;

      const canvasInputLocator = editorModel.appCanvas.locator('input');
      const canvasMoveElementHandleLocator = editorModel.appCanvas.locator(
        canvasMoveElementHandleSelector,
      );

      const firstTextFieldLocator = canvasInputLocator.first();
      const secondTextFieldLocator = canvasInputLocator.nth(1);

      await firstTextFieldLocator.focus();
      await firstTextFieldLocator.fill('textField1');

      await secondTextFieldLocator.focus();
      await secondTextFieldLocator.fill('textField2');

      await expect(firstTextFieldLocator).toHaveAttribute('value', 'textField1');
      await expect(secondTextFieldLocator).toHaveAttribute('value', 'textField2');

      await expect(canvasMoveElementHandleLocator).not.toBeVisible();

      // Move first element by dragging it to the right side of second element

      await clickCenter(page, firstTextFieldLocator);

      const secondTextFieldBoundingBox = await secondTextFieldLocator.boundingBox();
      expect(secondTextFieldBoundingBox).toBeDefined();

      const moveTargetX = secondTextFieldBoundingBox!.x + secondTextFieldBoundingBox!.width;
      const moveTargetY = secondTextFieldBoundingBox!.y + secondTextFieldBoundingBox!.height / 2;

      await editorModel.dragToAppCanvas(
        canvasMoveElementHandleSelector,
        true,
        moveTargetX,
        moveTargetY,
      );

      await expect(firstTextFieldLocator).toHaveAttribute('value', 'textField2');
      await expect(secondTextFieldLocator).toHaveAttribute('value', 'textField1');
    },
  );
});

test.only('can delete elements from page', async ({ page }) => {
  await withApp(
    {
      template: path.resolve(__dirname, './fixture'),
      cmd: 'dev',
    },
    async () => {
      const editorModel = new ToolpadEditor(page);

      await editorModel.goto(APP_ID_LOCAL_MARKER);

      await editorModel.waitForOverlay();

      const canvasInputLocator = editorModel.appCanvas.locator('input');

      const canvasRemoveElementButtonLocator = editorModel.appCanvas.locator(
        'button[aria-label="Remove"]',
      );
      // const canvasRemoveElementButtonLocator = editorModel.appCanvas.getByRole('button', {
      //  name: 'Remove',
      // });

      await expect(canvasInputLocator).toHaveCount(2);

      // Delete element by clicking

      await expect(canvasRemoveElementButtonLocator).not.toBeVisible();

      const firstTextFieldLocator = canvasInputLocator.first();

      await clickCenter(page, firstTextFieldLocator);
      await canvasRemoveElementButtonLocator.click();

      await expect(canvasInputLocator).toHaveCount(1);

      // Delete element by pressing key

      await clickCenter(page, firstTextFieldLocator);
      await page.keyboard.press('Backspace');

      await expect(canvasInputLocator).toHaveCount(0);
    },
  );
});

test('can create new component', async ({ page }) => {
  await withApp(
    {
      cmd: 'dev',
    },
    async () => {
      const editorModel = new ToolpadEditor(page);

      await editorModel.goto(APP_ID_LOCAL_MARKER);

      await editorModel.createPage('somePage');
      await editorModel.createComponent('someComponent');
    },
  );
});
