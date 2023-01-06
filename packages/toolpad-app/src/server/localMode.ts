import * as appDom from '../appDom';
import * as yaml from 'yaml';
import * as path from 'path';
import * as fs from 'fs/promises';
import config from '../config';
import invariant from 'invariant';
import { errorFrom } from '../utils/errors';

function getConfigFilePath() {
  const { projectDir } = config;
  invariant(projectDir, 'Toolpad in local mode must have a project directory defined');
  const filePath = path.resolve(projectDir, './toolpad.yaml');
  return filePath;
}

export async function saveLocalDom(app: appDom.AppDom): Promise<void> {
  const filePath = getConfigFilePath();
  await fs.writeFile(filePath, yaml.stringify(app), { encoding: 'utf-8' });
}

export async function loadLocalDom(): Promise<appDom.AppDom> {
  const filePath = getConfigFilePath();
  try {
    const content = await fs.readFile(filePath, { encoding: 'utf-8' });
    return yaml.parse(content);
  } catch (rawError) {
    const error = errorFrom(rawError);
    if (error.code === 'ENOENT') {
      const dom = appDom.createDefaultDom();
      await saveLocalDom(dom);
      return dom;
    }
    throw error;
  }
}
