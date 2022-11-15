import { codeFrameColumns } from '@babel/code-frame';
import { transform, TransformResult } from 'sucrase';
import { CompiledModule } from './types';
import { errorFrom } from './utils/errors';
import { findImports, isAbsoluteUrl } from './utils/strings';

export default function compileModule(src: string, filename: string): CompiledModule {
  const urlImports = findImports(src).filter((spec) => isAbsoluteUrl(spec));

  let compiled: TransformResult;

  try {
    compiled = transform(src, {
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
