import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { styled } from '@mui/material';
import { transform } from 'sucrase';
import { getRelativeBoundingBox, rectContainsPoint } from '../../utils/geometry';
import { StudioPage, NodeLayout, NodeId, CodeGenContext, StudioNode } from '../../types';
import { getNode } from '../../studioPage';
import { getStudioComponent } from '../../studioComponents';
import { DATA_PROP_NODE_ID, DATA_PROP_SLOT, DATA_PROP_SLOT_DIRECTION } from '../PageView/contants';

const PageViewRoot = styled('div')({});

export function getNodeLayout(viewElm: HTMLElement, elm: HTMLElement): NodeLayout | null {
  const nodeId = (elm.getAttribute(DATA_PROP_NODE_ID) as NodeId | undefined) || null;
  if (nodeId) {
    return {
      nodeId,
      rect: getRelativeBoundingBox(viewElm, elm),
      slots: [],
    };
  }
  return null;
}

export function getViewCoordinates(
  viewElm: HTMLElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const rect = viewElm.getBoundingClientRect();
  if (rectContainsPoint(rect, clientX, clientY)) {
    return { x: clientX - rect.x, y: clientY - rect.y };
  }
  return null;
}

const dependencies: {
  [source: string]: (() => Promise<any>) | undefined;
} = {
  react: () => import('react'),
  '@mui/material/Box': () => import('@mui/material/Box'),
  '@mui/material/Button': () => import('@mui/material/Button'),
  '@mui/x-data-grid': () => import('@mui/x-data-grid'),
  '@mui/material/Container': () => import('@mui/material/Container'),
  '@mui/material/Stack': () => import('@mui/material/Stack'),
  '@mui/material/Paper': () => import('@mui/material/Paper'),
  '@mui/material/TextField': () => import('@mui/material/TextField'),
};

interface Import {
  default: string | null;
  named: { imported: string; local: string }[];
}

interface ContextConstructorParams {
  // whether we're in the context of an editor
  editor: boolean;
}

class Context implements CodeGenContext {
  private page: StudioPage;

  private editor: boolean;

  private imports = new Map<string, Import>([
    [
      'react',
      {
        default: 'React',
        named: [],
      },
    ],
  ]);

  constructor(page: StudioPage, { editor }: ContextConstructorParams) {
    this.page = page;
    this.editor = editor;
  }

  // resolve props to expressions
  // eslint-disable-next-line class-methods-use-this
  resolveProps(node: StudioNode): Record<string, string> {
    const result: Record<string, string> = {};
    const component = getStudioComponent(node.component);
    Object.entries(node.props).forEach(([propName, propValue]) => {
      const propDefinition = component.props[propName];
      if (!propDefinition || !propValue) {
        return;
      }
      if (propValue.type === 'const') {
        result[propName] = JSON.stringify(propValue.value);
      }
      if (propValue.type === 'binding') {
        result[propName] = `_${propValue.state}`;
        if (propDefinition.onChangeProp) {
          const setStateIdentifier = `set_${propValue.state}`;
          if (propDefinition.onChangeEventHandler) {
            result[propDefinition.onChangeProp] =
              propDefinition.onChangeEventHandler(setStateIdentifier);
          } else {
            result[propDefinition.onChangeProp] = setStateIdentifier;
          }
        }
      }
    });
    return result;
  }

  renderNode(nodeId: NodeId): string {
    const node = getNode(this.page, nodeId);
    const component = getStudioComponent(node.component);
    const props = this.resolveProps(node);
    return component.render(this, node, props);
  }

  // eslint-disable-next-line class-methods-use-this
  renderProps(resolvedProps: Record<string, string>): string {
    return Object.entries(resolvedProps)
      .map(([name, value]) => {
        return `${name}={${value}}`;
      })
      .join(' ');
  }

  renderRootProps(nodeId: NodeId): string {
    if (!this.editor) {
      return '';
    }
    return `${DATA_PROP_NODE_ID}="${nodeId}"`;
  }

  renderSlots(name: string, direction: string | undefined): string {
    if (!this.editor) {
      return '';
    }
    return (
      `${DATA_PROP_SLOT}="${name}" ${DATA_PROP_SLOT_DIRECTION}={${direction || '"column"'}}` || ''
    );
  }

  renderPlaceholder(name: string): string {
    if (!this.editor) {
      return '';
    }
    this.addImport('@mui/material/Box', 'default', 'Box');
    return `
      <Box
        ${DATA_PROP_SLOT}="${name}"
        display="block"
        minHeight={40}
        minWidth={200}
      />
    `;
  }

  addImport(source: string, imported: string, local: string = imported) {
    let specifiers = this.imports.get(source);
    if (!specifiers) {
      specifiers = { default: null, named: [] };
      this.imports.set(source, specifiers);
    }
    if (imported === 'default') {
      if (specifiers.default && specifiers.default !== local) {
        throw new Error(`Default import specifier for "${source}" already defined as "${local}"`);
      } else {
        specifiers.default = local;
      }
    } else {
      specifiers.named.push({ imported, local });
    }
  }

  renderImports(): string {
    return Array.from(this.imports.entries(), ([source, specifiers]) => {
      const renderedSpecifiers = [];
      if (specifiers.default) {
        renderedSpecifiers.push(specifiers.default);
      }
      if (specifiers.named.length > 0) {
        const renderedNamedSpecifiers = specifiers.named
          .map((specifier) => {
            return specifier.imported === specifier.local
              ? specifier.imported
              : `${specifier.imported} as ${specifier.local}`;
          })
          .join(',');
        renderedSpecifiers.push(`{ ${renderedNamedSpecifiers} }`);
      }
      return `import ${renderedSpecifiers.join(', ')} from '${source}';`;
    }).join('\n');
  }

  renderStateHooks(): string {
    return Object.entries(this.page.state)
      .map(([key, state]) => {
        // TODO: figure out proper variable naming
        return `const [_${key}, set_${key}] = React.useState(${JSON.stringify(
          state.initialValue,
        )});`;
      })
      .join('\n');
  }

  async loadDependencies(): Promise<any> {
    return Object.fromEntries(
      await Promise.all(
        Array.from(this.imports.keys(), async (source) => {
          const loader = dependencies[source];
          if (!loader) {
            throw new Error(`Unsupported module imported "${source}"`);
          }
          return [source, await loader()];
        }),
      ),
    );
  }
}

function renderPage(page: StudioPage) {
  const ctx = new Context(page, { editor: true });
  const root = ctx.renderNode(page.root);

  const code = `
    ${ctx.renderImports()}

    export default function App () {
      ${ctx.renderStateHooks()}
      return (${root});
    }
  `;

  return { code, loadDependencies: () => ctx.loadDependencies() };
}

export interface PageViewProps {
  className?: string;
  // Callback for when the view has rendered. Make sure this value is stable
  onAfterRender?: () => void;
  page: StudioPage;
}

export default React.forwardRef(function PageView(
  { className, page, onAfterRender }: PageViewProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const renderedPage = React.useMemo(() => {
    return renderPage(page);
  }, [page]);

  React.useEffect(() => {
    if (!containerRef.current) {
      return () => {};
    }
    const container = containerRef.current;

    let canceled = false;
    renderedPage.loadDependencies().then((importedModules) => {
      if (canceled) {
        return;
      }

      console.log(renderedPage.code, importedModules);

      const { code: compiledCode } = transform(renderedPage.code, {
        transforms: ['jsx', 'typescript', 'imports'],
      });

      const run = new Function('require', 'module', 'exports', compiledCode);

      const require = (moduleId: string) => {
        return importedModules[moduleId];
      };
      const mod = {
        exports: {
          default: (() => null) as React.FC,
        },
      };
      run(require, mod, mod.exports);
      const App = mod.exports.default;
      ReactDOM.unmountComponentAtNode(container);
      ReactDOM.render(<App />, container, onAfterRender);
    });

    return () => {
      canceled = true;
    };
  }, [renderedPage, onAfterRender]);

  React.useEffect(() => {
    const container = containerRef.current;
    return () => {
      if (container) {
        ReactDOM.unmountComponentAtNode(container);
      }
    };
  }, []);

  return (
    <PageViewRoot ref={ref} className={className}>
      <div ref={containerRef} />
    </PageViewRoot>
  );
});
