import { posix as path } from 'path';
import { NodeId } from '@mui/toolpad-core';
import type { ModuleContext } from '.';
import * as appDom from '../../appDom';
import { pathToNodeImportSpecifier } from '../../utils/paths';

export default function generatePageFile(
  ctx: ModuleContext,
  dom: appDom.AppDom,
  pageId: NodeId,
): string {
  const domSpecifier = pathToNodeImportSpecifier(
    path.relative(path.dirname(ctx.filePath), ctx.appContext.domFilePath),
  );
  return `
    import * as React from 'react';
    import dom from ${JSON.stringify(domSpecifier)};
    import * as components from '@mui/toolpad-components'
    import { DomContextProvider, RenderedPage, ComponentsContextProvider } from '@mui/toolpad/runtime';

    export default function Page () {
      return (
        <ComponentsContextProvider value={components}>
          <DomContextProvider value={dom}>
            <RenderedPage key={${JSON.stringify(pageId)}} nodeId={${JSON.stringify(pageId)}} />
          </DomContextProvider>
        </ComponentsContextProvider>
      )
    }
  `;
}
