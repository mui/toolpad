import * as prettier from 'prettier';
import parserBabel from 'prettier/parser-babel';
import { StudioPage, NodeId, StudioNode } from './types';
import { getNode } from './studioPage';
import { getStudioComponent } from './studioComponents';

export interface RenderPageConfig {
  // whether we're in the context of an editor
  editor: boolean;
  // whether we have to pass on query body instead of id
  inlineQueries: boolean;
  // prettify output
  pretty: boolean;
}

interface Import {
  named: Map<string, string>;
  all?: string;
}

class Context {
  private page: StudioPage;

  private editor: boolean;

  private inlineQueries: boolean;

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

  constructor(page: StudioPage, { editor, inlineQueries }: RenderPageConfig) {
    this.page = page;
    this.editor = editor;
    this.inlineQueries = inlineQueries;
  }

  useDataLoader(queryId: string): string {
    this.dataLoaders.push(queryId);
    return `_${queryId}`;
  }

  // resolve props to expressions
  resolveProps(node: StudioNode): Record<string, string> {
    const result: Record<string, string> = {};
    const component = getStudioComponent(node.component);
    Object.entries(node.props).forEach(([propName, propValue]) => {
      const propDefinition = component.props[propName];
      if (!propDefinition || !propValue) {
        return;
      }
      if (propDefinition.type === 'DataQuery') {
        if (propValue.type !== 'const') {
          throw new Error(`Invariant: Invalid prop type for query "${propValue.type}"`);
        }
        if (propValue.value) {
          const spreadedValue = this.useDataLoader(propValue.value as string);
          result.$spread = `${result.$spread ? `${result.$spread} ` : ''}{...${spreadedValue}}`;
        }
      } else if (propValue.type === 'const') {
        result[propName] = JSON.stringify(propValue.value);
      } else if (propValue.type === 'binding') {
        result[propName] = `_${propValue.state}`;
        if (propDefinition.onChangeProp) {
          const setStateIdentifier = `set_${propValue.state}`;
          if (propDefinition.onChangeHandler) {
            // TODO: React.useCallback for this one
            const { params, valueGetter } = propDefinition.onChangeHandler;
            result[propDefinition.onChangeProp] = `(${params.join(
              ', ',
            )}) => ${setStateIdentifier}(${valueGetter})`;
          } else {
            result[propDefinition.onChangeProp] = setStateIdentifier;
          }
        }
      } else {
        throw new Error(`Invariant: Unkown prop type "${(propValue as any).type}"`);
      }
    });
    return result;
  }

  renderNode(nodeId: NodeId): string {
    const node = getNode(this.page, nodeId);
    const component = getStudioComponent(node.component);
    const props = this.resolveProps(node);
    const renderedChildren = node.children.map((childId) => this.renderNode(childId)).join('\n');
    const rendered = `
      <${component.importedName} ${this.renderProps(props)}>
        ${renderedChildren}
      </${component.importedName}>
    `;
    this.addImport(component.module, component.importedName, component.importedName);
    return this.editor
      ? `
        <__studioRuntime.WrappedStudioNode id="${node.id}">
          ${rendered}
        </__studioRuntime.WrappedStudioNode>
      `
      : rendered;
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
        const override = this.inlineQueries ? JSON.stringify(this.page.queries[queryId]) : null;
        return `const _${queryId} = useDataQuery(${JSON.stringify(
          `${this.page.id}/${queryId}`,
        )}, ${override});`;
      })
      .join('\n');
  }

  getDependencies(): string[] {
    return Array.from(this.imports.keys());
  }
}

export default function renderPageAsCode(
  page: StudioPage,
  configInit: Partial<RenderPageConfig> = {},
) {
  const config: RenderPageConfig = {
    editor: false,
    inlineQueries: false,
    pretty: false,
    ...configInit,
  };

  const ctx = new Context(page, config);
  const root = ctx.renderNode(page.root);

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
