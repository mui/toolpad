import * as path from 'path';
import * as appDom from '../../appDom';

import { AppTemplateId } from '../../types';
import { readJsonFile } from '../../utils/fs';

// __dirname does not work, see: https://github.com/vercel/next.js/discussions/14341
const DOMS_DIR_PATH = './src/server/appTemplateDoms';

const APP_TEMPLATE_DOM_PATHS: Record<AppTemplateId, string | null> = {
  blank: null,
  stats: path.resolve(DOMS_DIR_PATH, './statistics.json'),
  images: path.resolve(DOMS_DIR_PATH, './images.json'),
};

export function getAppTemplateDom(appTemplateId: AppTemplateId): Promise<appDom.AppDom> | null {
  const domPath = APP_TEMPLATE_DOM_PATHS[appTemplateId];
  return domPath ? readJsonFile(domPath) : null;
}
