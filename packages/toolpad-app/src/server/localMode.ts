import * as appDom from '../appDom';

let localDom: appDom.AppDom | undefined;

export async function saveLocalDom(app: appDom.AppDom): Promise<void> {
  localDom = app;
}

export async function loadLocalDom(): Promise<appDom.AppDom> {
  if (!localDom) {
    localDom = appDom.createDefaultDom();
  }
  return localDom;
}
