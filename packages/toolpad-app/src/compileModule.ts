import { codeFrameColumns } from '@babel/code-frame';
import { transform, TransformResult } from 'sucrase';
import { errorFrom } from '@mui/toolpad-utils/errors';
import { findImports, isAbsoluteUrl } from '@mui/toolpad-utils/strings';
import { CompiledModule } from './types';

export default function compileModule(src: string, filename: string): CompiledModule {
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
