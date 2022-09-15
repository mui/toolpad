import * as path from 'path';
import * as appDom from '../../appDom';

import { AppTemplateId } from '../../types';
import { readJsonFile } from '../../utils/fs';
import projectRoot from '../projectRoot';

const DOMS_DIR_PATH = './src/server/appTemplateDoms';

const APP_TEMPLATE_DOM_PATHS: Record<AppTemplateId, string | null> = {
  blank: null,
  stats: path.resolve(projectRoot, DOMS_DIR_PATH, './statistics.json'),
  images: path.resolve(projectRoot, DOMS_DIR_PATH, './images.json'),
};

export function getAppTemplateDom(appTemplateId: AppTemplateId): Promise<appDom.AppDom> | null {
  const domPath = APP_TEMPLATE_DOM_PATHS[appTemplateId];
  return domPath ? readJsonFile(domPath) : null;
}
