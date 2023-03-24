import * as appDom from './appDom';
import compileModule from './compileModule';
import { CompiledModule, RuntimeState } from './types';

function compileModules(dom: appDom.AppDom): Record<string, CompiledModule> {
  const result: Record<string, CompiledModule> = {};
  const root = appDom.getApp(dom);
  const { codeComponents = [], pages = [] } = appDom.getChildNodes(dom, root);

  for (const node of codeComponents) {
    const src = node.attributes.code.value;
    const name = `codeComponents/${node.id}`;
    result[name] = compileModule(src, name);
  }

  for (const node of pages) {
    const src = node.attributes.module?.value;
    if (src) {
      const name = `pages/${node.id}`;
      result[name] = compileModule(src, name);
    }
  }
  return result;
}

export interface CreateRuntimeStateParams {
  dom: appDom.AppDom;
}

export default function createRuntimeState({ dom }: CreateRuntimeStateParams): RuntimeState {
  return {
    dom: appDom.createRenderTree(dom),
    modules: compileModules(dom),
  };
}
