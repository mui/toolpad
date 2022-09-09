import * as appDom from '../../appDom';

import statisticsAppDom from './statistics.json';
import imagesAppDom from './images.json';
import { AppTemplateName } from '../../types';

export const APP_TEMPLATE_DOMS: Record<AppTemplateName, appDom.AppDom | null> = {
  blank: null,
  stats: statisticsAppDom as Record<string, any> as appDom.AppDom,
  images: imagesAppDom as Record<string, any> as appDom.AppDom,
};
