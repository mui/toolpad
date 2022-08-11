import { AppDom } from './appDom';

const migrations = new Map();

migrations.set('1.0.0', (appDom: AppDom): AppDom => {
  return appDom;
});
