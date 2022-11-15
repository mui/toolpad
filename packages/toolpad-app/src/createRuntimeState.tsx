import { codeFrameColumns } from '@babel/code-frame';
import { transform, TransformResult } from 'sucrase';
import * as appDom from './appDom';
import { CompiledModule, RuntimeState } from './types';
import { errorFrom } from './utils/errors';
import { findImports, isAbsoluteUrl } from './utils/strings';

export function compileModule(src: string, filename: string): CompiledModule {
  const urlImports = findImports(src).filter((spec) => isAbsoluteUrl(spec));

  let compiled: TransformResult;

  try {
    compiled = transform(src, {
      production: true,
      transforms: ['jsx', 'typescript', 'imports'],
      filePath: filename,
      jsxRuntime: 'classic',
    });
  } catch (rawError) {
    const error = errorFrom(rawError);
    if ((error as any).loc) {
      error.message = [error.message, codeFrameColumns(src, { start: (error as any).loc })].join(
        '\n\n',
      );
    }
    return { error };
  }

  return {
    ...compiled,
    urlImports,
  };
}

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
  appId: string;
  dom: appDom.AppDom;
}

export default function createRuntimeState({ appId, dom }: CreateRuntimeStateParams): RuntimeState {
  return {
    appId,
    dom: appDom.createRenderTree(dom),
    modules: compileModules(dom),
  };
}
