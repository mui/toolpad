import { ArgTypeDefinition } from '@mui/studio-core';
import * as prettier from 'prettier';
import parserBabel from 'prettier/parser-babel';
import { getStudioComponent } from './studioComponents';
import * as studioDom from './studioDom';
import {
  NodeId,
  PropExpression,
  RenderContext,
  ResolvedProps,
  StudioComponentDefinition,
  StudioNodeProps,
} from './types';
import { ExactEntriesOf } from './utils/types';

export interface RenderPageConfig {
  // whether we're in the context of an editor
  editor: boolean;
  // prettify output
  pretty: boolean;
}

/**
 * Represents a javascript scope and helpers to create variable bindings in it.
 */
class JavascriptScope {
  parent: JavascriptScope | null = null;

  bindings = new Set<string>();

  constructor(parent: JavascriptScope | null = null) {
    this.parent = parent;
  }

  addBinding(binding: string): void {
    if (this.bindings.has(binding)) {
      throw new Error(`There's already a binding in scope for "${binding}"`);
    }
    this.bindings.add(binding);
  }

  hasBinding(binding: string): boolean {
    return this.bindings.has(binding) || (this.parent && this.parent.hasBinding(binding)) || false;
  }

  createUniqueBinding(suggestedName: string): string {
    let index = 1;
    let binding = suggestedName;
    while (this.hasBinding(binding)) {
      binding = `${suggestedName}${index}`;
      index += 1;
    }
    this.addBinding(binding);
    return binding;
  }
}

interface Import {
  named: Map<string, string>;
  all?: string;
}

class Context implements RenderContext {
  private dom: studioDom.StudioDom;

  private page: studioDom.StudioPageNode;

  private editor: boolean;

  private imports = new Map<string, Import>();

  private dataLoaders: string[] = [];

  private moduleScope: JavascriptScope;

  private componentScope: JavascriptScope;

  constructor(
    dom: studioDom.StudioDom,
    page: studioDom.StudioPageNode,
    { editor }: RenderPageConfig,
  ) {
    this.dom = dom;
    this.page = page;
    this.editor = editor;

    this.moduleScope = new JavascriptScope(null);
    this.componentScope = new JavascriptScope(this.moduleScope);

    this.addImport('react', 'default', 'React');

    if (this.editor) {
      // this.addImport('@mui/studio-core/runtime', '*', '__studioRuntime');
      this.imports.set('@mui/studio-core/runtime', {
        named: new Map(),
        all: '__studioRuntime',
      });
    }
  }

  useDataLoader(queryId: string): string {
    this.addImport('@mui/studio-core', 'useDataQuery', 'useDataQuery');
    this.dataLoaders.push(queryId);
    return `_${queryId}`;
  }

  getComponentDefinition(node: studioDom.StudioNode): StudioComponentDefinition | null {
    if (studioDom.isPage(node)) {
      return getStudioComponent(this.dom, 'Page');
    }
    if (studioDom.isElement(node)) {
      return getStudioComponent(this.dom, node.component);
    }
    return null;
  }

  /**
   * Resolves StudioNode properties to expressions we can render in the code.
   * This will set up databinding if necessary
   */
  resolveProps<P>(
    node: studioDom.StudioElementNode | studioDom.StudioPageNode,
    resolvedChildren: ResolvedProps,
  ): ResolvedProps {
    const result: ResolvedProps = resolvedChildren;
    const component = this.getComponentDefinition(node);
    (Object.entries(node.props) as ExactEntriesOf<StudioNodeProps<P>>).forEach(
      ([propName, propValue]) => {
        const argDef: ArgTypeDefinition | undefined = component?.argTypes[propName];
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
          result[propName] = {
            type: 'expression',
            value: JSON.stringify(propValue.value),
          };
        } else if (propValue.type === 'binding') {
          result[propName] = {
            type: 'expression',
            value: `_${propValue.state}`,
          };
          if (argDef.onChangeProp) {
            const setStateIdentifier = `set_${propValue.state}`;
            if (argDef.onChangeHandler) {
              // TODO: React.useCallback for this one?
              const { params, valueGetter } = argDef.onChangeHandler;
              result[argDef.onChangeProp] = {
                type: 'expression',
                value: `(${params.join(', ')}) => ${setStateIdentifier}(${valueGetter})`,
              };
            } else {
              result[argDef.onChangeProp] = {
                type: 'expression',
                value: setStateIdentifier,
              };
            }
          }
        } else {
          throw new Error(`Invariant: Unkown prop type "${(propValue as any).type}"`);
        }
      },
    );

    return result;
  }

  renderComponent(name: string, resolvedProps: ResolvedProps): string {
    const { children, ...props } = resolvedProps;
    return children
      ? `<${name} ${this.renderProps(props)}>${this.renderJsxContent(children)}</${name}>`
      : `<${name} ${this.renderProps(props)}/>`;
  }

  renderNodeChildren(node: studioDom.StudioElementNode | studioDom.StudioPageNode): ResolvedProps {
    const result: ResolvedProps = {};
    const nodeChildren = studioDom.getChildNodes(this.dom, node);
    // eslint-disable-next-line no-restricted-syntax
    for (const [prop, children] of Object.entries(nodeChildren)) {
      if (children) {
        if (children.length === 1) {
          result[prop] = this.renderNode(children[0]);
        } else if (children.length > 1) {
          result[prop] = {
            type: 'jsxFragment',
            value: children
              .map((child): string => this.renderJsxContent(this.renderNode(child)))
              .join('\n'),
          };
        }
      }
    }

    const component = this.getComponentDefinition(node);

    if (this.editor && component) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [prop, argType] of Object.entries(component.argTypes)) {
        if (argType?.typeDef.type === 'element') {
          if (argType.control?.type === 'slots') {
            const existingProp = result[prop];

            result[prop] = {
              type: 'jsxElement',
              value: `
                <__studioRuntime.Slots prop=${JSON.stringify(prop)}>
                  ${existingProp ? this.renderJsxContent(existingProp) : ''}
                </__studioRuntime.Slots>
              `,
            };
          } else if (argType.control?.type === 'slot') {
            const existingProp = result[prop];

            result[prop] = {
              type: 'jsxElement',
              value: `
                <__studioRuntime.Placeholder prop=${JSON.stringify(prop)}>
                  ${existingProp ? this.renderJsxContent(existingProp) : ''}
                </__studioRuntime.Placeholder>
              `,
            };
          }
        }
      }
    }

    return result;
  }

  renderNode(node: studioDom.StudioElementNode | studioDom.StudioPageNode): PropExpression {
    const component = this.getComponentDefinition(node);
    if (!component) {
      return {
        type: 'expression',
        value: 'null',
      };
    }

    const nodeChildren = this.renderNodeChildren(node);
    const resolvedProps = this.resolveProps(node, nodeChildren);
    const rendered = component.render(this, resolvedProps);

    // TODO: We may not need the `component` prop anymore. Remove?
    return {
      type: 'jsxElement',
      value: this.editor
        ? `
          <__studioRuntime.WrappedStudioNode id="${node.id}">
            ${rendered}
          </__studioRuntime.WrappedStudioNode>
        `
        : rendered,
    };
  }

  /**
   * Renders a node to a string that can be inlined as the return value of a React component
   * @example
   * `function Hello () {
   *   return ${RESULT};
   * }`
   */
  renderRoot(node: studioDom.StudioPageNode): string {
    const expr = this.renderNode(node);
    return this.renderJsExpression(expr);
  }

  /**
   * Renders resolved properties to a string that can be inlined as JSX attrinutes
   * @example `<Hello ${RESULT} />`
   */
  renderProps(resolvedProps: ResolvedProps): string {
    return (Object.entries(resolvedProps) as ExactEntriesOf<ResolvedProps>)
      .map(([name, expr]) => {
        if (!expr) {
          return '';
        }
        if (name === '$spread') {
          return expr;
        }
        return `${name}={${this.renderJsExpression(expr)}}`;
      })
      .join(' ');
  }

  /**
   * Renders an expression to a string that can be used as a javascript
   * expression. e.g. as the RHS of an assignment statement
   * @example `const hello = ${RESULT}`
   */
  // eslint-disable-next-line class-methods-use-this
  renderJsExpression(expr?: PropExpression): string {
    if (!expr) {
      return 'undefined';
    }
    if (expr.type === 'jsxFragment') {
      return `<>${expr.value}</>`;
    }
    return expr.value;
  }

  /**
   * Renders an expression to a string that can be inlined as children in
   * a JSX element.
   * @example `<Hello>${RESULT}</Hello>`
   */
  renderJsxContent(expr?: PropExpression): string {
    if (!expr) {
      return '';
    }
    if (expr.type === 'jsxElement' || expr.type === 'jsxFragment') {
      return expr.value;
    }
    return `{${this.renderJsExpression(expr)}}`;
  }

  /**
   * Adds an import to the page module. Returns an identifier that's based on local that can
   * be used to reference the import.
   */
  addImport(source: string, imported: string, suggestedName: string = imported): string {
    // TODO: introduce concept of scope and make sure local is unique

    let specifiers = this.imports.get(source);
    if (!specifiers) {
      specifiers = { named: new Map() };
      this.imports.set(source, specifiers);
    }

    const existing = specifiers.named.get(imported);
    if (existing) {
      return existing;
    }

    const localName = this.moduleScope.createUniqueBinding(suggestedName);
    specifiers.named.set(imported, localName);
    return localName;
  }

  renderImports(): string {
    const aliasLines: string[] = [];

    const importLines = Array.from(this.imports.entries(), ([source, specifiers]) => {
      const renderedSpecifiers = [];
      const renderedNamedSpecifiers = [];
      // const importAll = specifiers.named.get('*')

      if (specifiers.named.size > 0) {
        // eslint-disable-next-line no-restricted-syntax
        for (const [imported, local] of specifiers.named.entries()) {
          if (imported === 'default') {
            renderedSpecifiers.push(local);
          } else {
            renderedNamedSpecifiers.push(
              imported === local
                ? imported
                : [imported, local].join(specifiers.all ? ': ' : ' as '),
            );
          }
        }
      }

      if (specifiers.all) {
        renderedSpecifiers.push(`* as ${specifiers.all}`);
        if (renderedNamedSpecifiers.length > 0) {
          aliasLines.push(`const ${renderedNamedSpecifiers.join(', ')} = ${specifiers.all};`);
        }
      } else if (renderedNamedSpecifiers.length > 0) {
        renderedSpecifiers.push(`{ ${renderedNamedSpecifiers.join(', ')} }`);
      }

      return `import ${renderedSpecifiers.join(', ')} from '${source}';`;
    });

    return [...importLines, ...aliasLines].join('\n');
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
  const root: string = ctx.renderRoot(page);

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

  return { code };
}
