import * as path from 'path';
import * as url from 'url';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { test, expect, Locator } from '../../playwright/localTest';
import clickCenter from '../../utils/clickCenter';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({});

test('hello', ({ customServer }) => {
  console.log(customServer.url);
});
