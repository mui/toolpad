import * as path from 'path';
import * as appDom from '../../appDom';
import { migrateUp } from '../../appDom/migrations';
import { AppTemplateId } from '../../types';
import { readJsonFile } from '../../utils/fs';
import config from '../config';
import projectRoot from '../projectRoot';

const DOMS_DIR_PATH = './src/server/appTemplateDoms';

const APP_TEMPLATE_DOM_PATHS: Record<AppTemplateId, string | null> = {
  blank: null,
  stats: path.resolve(
    projectRoot,
    DOMS_DIR_PATH,
    // @TODO: Remove demo template once demo supports server-side queries
    config.isDemo ? './statistics-demo.json' : './statistics.json',
  ),
  images: path.resolve(
    projectRoot,
    DOMS_DIR_PATH,
    // @TODO: Remove demo template once demo supports server-side queries
    config.isDemo ? './images-demo.json' : './images.json',
  ),
  default: path.resolve(projectRoot, DOMS_DIR_PATH, './default.json'),
};

export async function getAppTemplateDom(
  appTemplateId: AppTemplateId,
): Promise<appDom.AppDom | null> {
  const domPath = APP_TEMPLATE_DOM_PATHS[appTemplateId];
  const dom = domPath ? await readJsonFile(domPath) : null;
  return dom ? migrateUp(dom) : null;
}
