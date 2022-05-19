import { createComponent, ToolpadComponent, TOOLPAD_COMPONENT } from '@mui/toolpad-core';
import * as React from 'react';
import * as ReactIs from 'react-is';
import { transform } from 'sucrase';
import { findImports, isAbsoluteUrl } from '../utils/strings';
import createRequire from './createRequire';

function ensureToolpadComponent<P>(Component: React.ComponentType<P>): ToolpadComponent<P> {
  if ((Component as any)[TOOLPAD_COMPONENT]) {
    return Component as ToolpadComponent<P>;
  }
  return createComponent(Component);
}

export default async function createCodeComponent(src: string): Promise<ToolpadComponent> {
  const imports = findImports(src).filter((maybeUrl) => isAbsoluteUrl(maybeUrl));

  const compiled = transform(src, {
    transforms: ['jsx', 'typescript', 'imports'],
  });

  const require = await createRequire(imports);

  const exports: any = {};

  const globals = {
    exports,
    module: { exports },
    require,
  };

  const instantiateModuleCode = `
    (${Object.keys(globals).join(', ')}) => {
      ${compiled.code}
    }
  `;

  // eslint-disable-next-line no-eval
  const instantiateModule = (0, eval)(instantiateModuleCode);

  instantiateModule(...Object.values(globals));

  const Component: unknown = exports.default;

  if (!ReactIs.isValidElementType(Component) || typeof Component === 'string') {
    throw new Error(`No React Component exported.`);
  }

  return ensureToolpadComponent(Component);
}
