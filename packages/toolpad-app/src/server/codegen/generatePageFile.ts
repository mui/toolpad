import { posix as path } from 'path';
import { NodeId, TOOLPAD_COMPONENT } from '@mui/toolpad-core';
import * as components from '@mui/toolpad-components';
import type { ModuleContext } from '.';
import * as appDom from '../../appDom';
import { pathToNodeImportSpecifier } from '../../utils/paths';

const componentConfigs = Object.fromEntries(
  Object.entries(components).map(([name, component]) => [name, component[TOOLPAD_COMPONENT]]),
);

console.log(componentConfigs);

interface PageContext {
  usedComponents: Set<string>;
}

function renderSubtree(ctx: PageContext, dom: appDom.AppDom, node: appDom.ElementNode): string {
  const { children = [] } = appDom.getChildNodes(dom, node);
  const content = children.map((child) => renderSubtree(ctx, dom, child));
  const component = node.attributes.component;
  ctx.usedComponents.add(component);
  const propsContent = Object.entries(node.props || {}).map(([key, value]) => {
    return `${key}={${JSON.stringify(value)}}`;
  });

  return `
  <Box
          sx={{
            display: 'flex',
            // alignItems: boundLayoutProps.verticalAlign,
            // justifyContent: boundLayoutProps.horizontalAlign,
          }}
        >
  <${component} ${propsContent.join(' ')}>${content.join('\n')}</${component}>
  </Box>`;
}

export default function generatePageFile(
  ctx: ModuleContext,
  dom: appDom.AppDom,
  pageId: NodeId,
): string {
  const domSpecifier = pathToNodeImportSpecifier(
    path.relative(path.dirname(ctx.filePath), ctx.appContext.domFilePath),
  );

  const pageContext = {
    usedComponents: new Set<string>(),
  };

  const page = appDom.getNode(dom, pageId, 'page');
  const { children = [] } = appDom.getChildNodes(dom, page);

  const content = children.map((child) => renderSubtree(pageContext, dom, child));

  const componentsImport =
    pageContext.usedComponents.size > 0
      ? `import { ${Array.from(pageContext.usedComponents).join(
          ', ',
        )} } from '@mui/toolpad-components';`
      : '';

  return `
    import * as React from 'react';
    import dom from ${JSON.stringify(domSpecifier)};
    import * as components from '@mui/toolpad-components'
    import { Container, Stack, Box } from '@mui/material';
    import { DomContextProvider, RenderedPage, ComponentsContextProvider } from '@mui/toolpad/runtime';
    ${componentsImport}

    export default function Page () {
      return (
        <ComponentsContextProvider value={components}>
          <DomContextProvider value={dom}>
            <Container>
              <Stack
                data-testid="page-root"
                direction="column"
                sx={{
                  my: 2,
                  gap: 1,
                }}
              >
                ${content.join('\n')}
              </Stack>
            </Container>
            <RenderedPage key={${JSON.stringify(pageId)}} nodeId={${JSON.stringify(pageId)}} />
          </DomContextProvider>
        </ComponentsContextProvider>
      )
    }
  `;
}
