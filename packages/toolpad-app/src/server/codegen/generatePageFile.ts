import type { ModuleContext } from '.';
import * as appDom from '../../appDom';

export default function generatePageFile(ctx: ModuleContext, page: appDom.PageNode): string {
  return `
  import * as React from 'react';

  export default function Page () {
    return <div>{${JSON.stringify(page.name)}}</div>
  }
`;
}
