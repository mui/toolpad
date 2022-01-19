import { ArgTypeDefinition } from '@mui/studio-core';
import * as prettier from 'prettier';
import parserBabel from 'prettier/parser-babel';
import { getStudioComponent } from './studioComponents';
import * as studioDom from './studioDom';
import { NodeId, StudioNodeProps } from './types';
import { ExactEntriesOf } from './utils/types';

export interface RenderPageConfig {
  // whether we're in the context of an editor
  editor: boolean;
  // prettify output
  pretty: boolean;
}

export type RenderComponent = (ctx: Context, resolvedProps: Record<string, string>) => string;

function renderPage(ctx: Context, props: Record<string, string>) {
  ctx.addImport('@mui/material', 'Container', 'Container');
  ctx.addImport('@mui/material', 'Stack', 'MuiStack');
  ctx.addImport('@mui/studio-core', 'Slots', 'Slots');

  const { children, ...other } = props;

  return `
    <Container ${ctx.renderProps(other)}>
      <MuiStack direction="column" gap={2} my={2}>
        <Slots prop="children">
          {${children}}
        </Slots>
      </MuiStack>
    </Container>
  `;
}

interface Import {
  named: Map<string, string>;
  all?: string;
}

class Context {
  private dom: studioDom.StudioDom;

  private page: studioDom.StudioPageNode;

  private editor: boolean;

  private imports = new Map<string, Import>([
    [
      'react',
      {
        named: new Map([['default', 'React']]),
      },
    ],
    [
      '@mui/studio-core',
      {
        named: new Map([['useDataQuery', 'useDataQuery']]),
      },
    ],
    [
      '@mui/studio-core/runtime',
      {
        named: new Map(),
        all: '__studioRuntime',
      },
    ],
  ]);

  private dataLoaders: string[] = [];

  constructor(
    dom: studioDom.StudioDom,
    page: studioDom.StudioPageNode,
    { editor }: RenderPageConfig,
  ) {
    this.dom = dom;
    this.page = page;
    this.editor = editor;
  }

  useDataLoader(queryId: string): string {
    this.dataLoaders.push(queryId);
    return `_${queryId}`;
  }

  // resolve props to expressions
  resolveProps<P>(
    node: studioDom.StudioElementNode,
    resolvedChildren: Record<string, string>,
  ): Record<string, string> {
    const result: Record<string, string> = resolvedChildren;
    const component = getStudioComponent(this.dom, node.component);
    (Object.entries(node.props) as ExactEntriesOf<StudioNodeProps<P>>).forEach(
      ([propName, propValue]) => {
        const argDef: ArgTypeDefinition | undefined = component.argTypes[propName];
        if (!argDef || !propValue || typeof propName !== 'string' || result[propName]) {
          return;
        }

        if (argDef.typeDef.type === 'dataQuery') {
          if (propValue.type !== 'const') {
            throw new Error(`TODO: make this work for bindings`);
          }
          if (propValue.value && typeof propValue.value === 'string') {
            const spreadedValue = this.useDataLoader(propValue.value);
            result.$spread = `${result.$spread ? `${result.$spread} ` : ''}{...${spreadedValue}}`;
          }
        } else if (propValue.type === 'const') {
          result[propName] = JSON.stringify(propValue.value);
        } else if (propValue.type === 'binding') {
          result[propName] = `_${propValue.state}`;
          if (argDef.onChangeProp) {
            const setStateIdentifier = `set_${propValue.state}`;
            if (argDef.onChangeHandler) {
              // TODO: React.useCallback for this one
              const { params, valueGetter } = argDef.onChangeHandler;
              result[argDef.onChangeProp] = `(${params.join(
                ', ',
              )}) => ${setStateIdentifier}(${valueGetter})`;
            } else {
              result[argDef.onChangeProp] = setStateIdentifier;
            }
          }
        } else {
          throw new Error(`Invariant: Unkown prop type "${(propValue as any).type}"`);
        }
      },
    );

    return result;
  }

  renderNodeInternal(
    id: string,
    componentName: string | RenderComponent,
    resolvedProps: Record<string, string>,
  ): string {
    const rendered =
      typeof componentName === 'string'
        ? `<${componentName} ${this.renderProps(resolvedProps)} />`
        : componentName(this, resolvedProps);

    return this.editor
      ? `
        <__studioRuntime.WrappedStudioNode id="${id}">
          ${rendered}
        </__studioRuntime.WrappedStudioNode>
      `
      : rendered;
  }

  renderChildren(
    node: studioDom.StudioElementNode | studioDom.StudioPageNode,
  ): Record<string, string> {
    const result: Record<string, string> = {};
    const nodeChildren = studioDom.getChildNodes(this.dom, node);
    // eslint-disable-next-line no-restricted-syntax
    for (const [prop, children] of Object.entries(nodeChildren)) {
      if (children) {
        result[prop] = `<>${children.map((child) => this.renderNode(child)).join('\n')}</>`;
      }
    }
    return result;
  }

  renderPage(page: studioDom.StudioPageNode): string {
    return this.renderNodeInternal(page.id, renderPage, {
      children: this.renderChildren(page).children,
    });
  }

  renderNode(node: studioDom.StudioElementNode): string {
    const component = getStudioComponent(this.dom, node.component);
    this.addImport(component.module, component.importedName, component.importedName);
    const nodeChildren = this.renderChildren(node);
    const resolvedProps = this.resolveProps(node, nodeChildren);
    return this.renderNodeInternal(node.id, component.importedName, resolvedProps);
  }

  // eslint-disable-next-line class-methods-use-this
  renderProps(resolvedProps: Record<string, string>): string {
    return Object.entries(resolvedProps)
      .map(([name, value]) => {
        if (name === '$spread') {
          return value;
        }
        return `${name}={${value}}`;
      })
      .join(' ');
  }

  addImport(source: string, imported: string, local: string = imported) {
    let specifiers = this.imports.get(source);
    if (!specifiers) {
      specifiers = { named: new Map() };
      this.imports.set(source, specifiers);
    }

    const existing = specifiers.named.get(imported);
    if (!existing) {
      specifiers.named.set(imported, local);
    } else if (existing !== local) {
      // TODO: we can reassign to a local variable
      throw new Error(
        `Trying to import "${imported}" as "${local}" but it is already imported as "${existing}"`,
      );
    }
  }

  renderImports(): string {
    return Array.from(this.imports.entries(), ([source, specifiers]) => {
      const renderedSpecifiers = [];
      if (specifiers.named.size > 0) {
        const renderedNamedSpecifiers = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const [imported, local] of specifiers.named.entries()) {
          if (imported === 'default') {
            renderedSpecifiers.push(local);
          } else {
            renderedNamedSpecifiers.push(imported === local ? imported : `${imported} as ${local}`);
          }
        }

        if (renderedNamedSpecifiers.length > 0) {
          renderedSpecifiers.push(`{ ${renderedNamedSpecifiers.join(', ')} }`);
        }
      }

      if (specifiers.all) {
        renderedSpecifiers.push(`* as ${specifiers.all}`);
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

  renderDataLoaderHooks(): string {
    return this.dataLoaders
      .map((queryId) => {
        return `const _${queryId} = useDataQuery(${JSON.stringify(queryId)});`;
      })
      .join('\n');
  }

  getDependencies(): string[] {
    return Array.from(this.imports.keys());
  }
}

export default function renderPageCode(
  dom: studioDom.StudioDom,
  pageNodeId: NodeId,
  configInit: Partial<RenderPageConfig> = {},
) {
  const config: RenderPageConfig = {
    editor: false,
    pretty: false,
    ...configInit,
  };

  const page = studioDom.getNode(dom, pageNodeId);
  studioDom.assertIsPage(page);
  const ctx = new Context(dom, page, config);
  const root = ctx.renderPage(page);

  let code: string = `
    ${ctx.renderImports()}

    export default function App () {
      ${ctx.renderStateHooks()}
      ${ctx.renderDataLoaderHooks()}
      return (
        ${root}
      );
    }
  `;

  if (config.pretty) {
    code = prettier.format(code, {
      parser: 'babel-ts',
      plugins: [parserBabel],
    });
  }

  return { code, dependencies: ctx.getDependencies() };
}
