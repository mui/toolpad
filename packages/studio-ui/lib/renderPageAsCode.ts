import * as prettier from 'prettier';
import parserTypescript from 'prettier/parser-typescript';
import { transform, Transform } from 'sucrase';
import { StudioPage, NodeId, StudioNode, CodeGenContext } from './types';
import { getNode } from './studioPage';
import { getStudioComponent } from './studioComponents';
import { DATA_PROP_NODE_ID, DATA_PROP_SLOT, DATA_PROP_SLOT_DIRECTION } from './constants';

export interface RenderPageConfig {
  // whether we're in the context of an editor
  editor: boolean;
  // sucrase transforms
  transforms: Transform[];
  // prettify output
  pretty: boolean;
}

interface Import {
  default: string | null;
  named: Map<string, string>;
}

class Context implements CodeGenContext {
  private page: StudioPage;

  private editor: boolean;

  private imports = new Map<string, Import>([
    [
      'react',
      {
        default: 'React',
        named: new Map(),
      },
    ],
  ]);

  private dataLoaders: string[] = [];

  constructor(page: StudioPage, { editor }: RenderPageConfig) {
    this.page = page;
    this.editor = editor;
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
        result[propName] = this.useDataLoader(propValue.value as string);
      } else if (propValue.type === 'const') {
        result[propName] = JSON.stringify(propValue.value);
      } else if (propValue.type === 'binding') {
        result[propName] = `_${propValue.state}`;
        if (propDefinition.onChangeProp) {
          const setStateIdentifier = `set_${propValue.state}`;
          if (propDefinition.onChangeEventHandler) {
            // TODO: React.useCallback for this one
            result[propDefinition.onChangeProp] =
              propDefinition.onChangeEventHandler(setStateIdentifier);
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
    this.addImport('@mui/material', 'Box', 'Box');
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
      specifiers = { default: null, named: new Map() };
      this.imports.set(source, specifiers);
    }
    if (imported === 'default') {
      if (specifiers.default && specifiers.default !== local) {
        throw new Error(`Default import specifier for "${source}" already defined as "${local}"`);
      } else {
        specifiers.default = local;
      }
    } else {
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
  }

  renderImports(): string {
    return Array.from(this.imports.entries(), ([source, specifiers]) => {
      const renderedSpecifiers = [];
      if (specifiers.default) {
        renderedSpecifiers.push(specifiers.default);
      }
      if (specifiers.named.size > 0) {
        const renderedNamedSpecifiers = Array.from(
          specifiers.named.entries(),
          ([imported, local]) => {
            return imported === local ? imported : `${imported} as ${local}`;
          },
        ).join(',');
        renderedSpecifiers.push(`{ ${renderedNamedSpecifiers} }`);
      }
      return `import ${renderedSpecifiers.join(', ')} from '${source}';`;
    }).join('\n');
  }

  renderDataLoader(): string {
    if (this.dataLoaders.length <= 0) {
      return '';
    }
    const host = 'http://localhost:3000';
    return `
      function useDataQuery(queryId) {
        const [result, setResult] = React.useState({});
      
        React.useEffect(() => {
          if (!queryId) {
            return;
          }
          setResult({ loading: true });
          fetch(\`${host}/api/data/${this.page.id}/\${queryId}\`, {
            method: 'POST',
            ${
              this.editor
                ? // This is very sketchy, let's make sure we have query provider for this in the editor
                  `body: JSON.stringify(${JSON.stringify(this.page.queries)}[queryId]),`
                : ''
            }
            headers: {
              'content-type': 'application/json',
            },
          }).then(
            async (res) => {
              const body = (await res.json());
              if (typeof body.error === 'string') {
                setResult({ loading: false, error: body.error });
              } else if (body.result) {
                const { fields, data: rows } = body.result;
                const columns = Object.entries(fields).map(([field, def]) => ({
                  ...def,
                  field,
                }));
      
                const columnsFingerPrint = JSON.stringify(columns);
                setResult({ loading: false, rows, columns, key: columnsFingerPrint });
              } else {
                throw new Error(\`Invariant: \${queryId} returned invalid result\`);
              }
            },
            (error) => {
              setResult({ loading: false, error: error.message });
            },
          );
        }, [queryId]);
      
        return result;
      }
    `;
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
        return `const _${queryId} = useDataQuery("${queryId}")`;
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
    transforms: [],
    pretty: false,
    ...configInit,
  };

  const ctx = new Context(page, config);
  const root = ctx.renderNode(page.root);

  let code: string = `
    ${ctx.renderImports()}

    ${ctx.renderDataLoader()}

    export default function App () {
      ${ctx.renderStateHooks()}
      ${ctx.renderDataLoaderHooks()}
      return (${root});
    }
  `;

  if (config.transforms.length > 0) {
    const { code: compiledCode } = transform(code, {
      transforms: config.transforms,
    });
    code = compiledCode;
  }

  if (config.pretty) {
    code = prettier.format(code, {
      parser: 'typescript',
      plugins: [parserTypescript],
    });
  }

  return { code, dependencies: ctx.getDependencies() };
}
