import * as appDom from '../appDom';

export function generateCode(dom: appDom.AppDom): { files: Map<string, string> } {
  return {
    files: new Map([['/index.tsx', `console.log(${JSON.stringify(dom)})`]]),
  };
}
