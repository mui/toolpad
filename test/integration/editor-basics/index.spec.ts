import { ToolpadEditor } from '../../models/ToolpadEditor';
import { ToolpadHome } from '../../models/ToolpadHome';
import { test } from '../../playwright/test';

test('editor basics', async ({ page }) => {
  const homeModel = new ToolpadHome(page);
  await homeModel.goto();
  const app = await homeModel.createApplication({});

  const editorModel = new ToolpadEditor(page);
  await editorModel.goto(app.id);

  await editorModel.createPage('somePage');
  await editorModel.createComponent('someComponent');
});
