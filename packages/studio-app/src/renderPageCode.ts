import { ArgTypeDefinition } from '@mui/studio-core';
import * as prettier from 'prettier';
import parserBabel from 'prettier/parser-babel';
import Imports from './codeGen/Imports';
import Scope from './codeGen/Scope';
import { getStudioComponent } from './studioComponents';
import * as studioDom from './studioDom';
import {
  NodeId,
  PropExpression,
  RenderContext,
  ResolvedProps,
  StudioComponentDefinition,
  StudioNodeProp,
  StudioNodeProps,
} from './types';
import { camelCase } from './utils/strings';
import { ExactEntriesOf } from './utils/types';
import * as bindings from './utils/bindings';

export interface RenderPageConfig {
  // whether we're in the context of an editor
  editor: boolean;
  // prettify output
  pretty: boolean;
}

class Context implements RenderContext {
  private dom: studioDom.StudioDom;

  private page: studioDom.StudioPageNode;

  private editor: boolean;

  private imports: Imports;

  private dataLoaders: { queryId: string; variable: string }[] = [];

  private moduleScope: Scope;

  private componentScope: Scope;

  private reactAlias: string = 'undefined';

  private runtimeAlias: string = 'undefined';

  private useStateHooks: {
    [id in string]?: { state: string; setState: string; defaultValue?: unknown };
  } = {};

  private state: { [id: string]: string } = {};

  constructor(
    dom: studioDom.StudioDom,
    page: studioDom.StudioPageNode,
    { editor }: RenderPageConfig,
  ) {
    this.dom = dom;
    this.page = page;
    this.editor = editor;

    this.moduleScope = new Scope(null);
    this.componentScope = new Scope(this.moduleScope);
    this.imports = new Imports(this.moduleScope);

    this.reactAlias = this.addImport('react', 'default', 'React');

    if (this.editor) {
      this.runtimeAlias = this.addImport('@mui/studio-core/runtime', '*', '__studioRuntime');
    }
  }

  useDataLoader(queryId: string): string {
    const variable = this.componentScope.createUniqueBinding(queryId);
    this.dataLoaders.push({ queryId, variable });
    return variable;
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

  collectState() {
    const nodes = studioDom.getDescendants(this.dom, this.page);
    nodes.forEach((node) => {
      (Object.values(node.props) as StudioNodeProp<unknown>[]).forEach((prop) => {
        if (prop?.type === 'binding') {
          const parsedExpr = bindings.parse(prop.value);
          bindings
            .getInterpolations(parsedExpr)
            .forEach((interpolation) => this.addState(interpolation));
        }
      });
    });
  }

  addState(id: string) {
    const [nodeName, prop] = id.split('.');
    const nodeId = studioDom.getNodeIdByName(this.dom, nodeName);

    if (!nodeId) {
      console.warn(`Can't find node with name "${nodeName}"`);
      return;
    }

    const stateId = `${nodeId}.${prop}`;
    let stateHook = this.useStateHooks[stateId];

    if (!stateHook) {
      const node = studioDom.getNode(this.dom, nodeId);

      if (!studioDom.isElement(node)) {
        // TODO: support other nodes
        throw new Error(`Unsupported node type "${node.type}" in binding "${id}"`);
      }

      const component = this.getComponentDefinition(node);

      if (!component) {
        throw new Error(`Can't find component for node "${node.id}"`);
      }

      const argType = component.argTypes[prop];

      if (!argType) {
        throw new Error(`Can't find argType for "${node.name}.${prop}"`);
      }

      if (!argType.onChangeHandler) {
        throw new Error(`"${node.name}.${prop}" is not a controlled property`);
      }

      const stateVarSuggestion = camelCase(nodeName, prop);
      const state = this.componentScope.createUniqueBinding(stateVarSuggestion);

      const setStateVarSuggestion = camelCase('set', nodeName, prop);
      const setState = this.componentScope.createUniqueBinding(setStateVarSuggestion);

      stateHook = {
        state,
        setState,
        defaultValue: argType.defaultValue,
      };
      this.useStateHooks[stateId] = stateHook;
      this.state[stateId] = state;
    }
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

        const stateId = `${node.id}.${propName}`;
        const hook = this.useStateHooks[stateId];

        if (argDef.typeDef.type === 'dataQuery') {
          if (propValue.type !== 'const') {
            throw new Error(`TODO: make this work for bindings`);
          }
          if (propValue.value && typeof propValue.value === 'string') {
            const spreadedValue = this.useDataLoader(propValue.value);
            result.$spread = `${result.$spread ? `${result.$spread} ` : ''}{...${spreadedValue}}`;
          }
        } else if (hook) {
          result[propName] = {
            type: 'binding',
            value: hook.state,
          };
          if (argDef.onChangeProp) {
            if (argDef.onChangeHandler) {
              // TODO: React.useCallback for this one?
              const { params, valueGetter } = argDef.onChangeHandler;
              result[argDef.onChangeProp] = {
                type: 'binding',
                value: `(${params.join(', ')}) => ${hook.setState}(${valueGetter})`,
              };
            } else {
              result[argDef.onChangeProp] = {
                type: 'binding',
                value: hook.setState,
              };
            }
          }
        } else if (propValue.type === 'const') {
          result[propName] = {
            type: 'binding',
            value: JSON.stringify(propValue.value),
          };
        } else if (propValue.type === 'binding') {
          const parsedExpr = bindings.parse(propValue.value);

          // Resolve each named variable to its resolved variable in code
          const resolvedExpr = bindings.resolve(parsedExpr, (part) => {
            const [nodeName, prop, ...path] = part.split('.');
            const nodeId = studioDom.getNodeIdByName(this.dom, nodeName);
            const partStateId = `${nodeId}.${prop}`;
            const baseState = this.state[partStateId];
            return path.length > 0 ? `${baseState}.${path.join('.')}` : baseState;
          });

          const value = bindings.format(resolvedExpr, propValue.format);

          result[propName] = {
            type: 'binding',
            value,
          };
        } else {
          console.warn(`Invariant: Unkown prop type "${(propValue as any).type}"`);
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
                <${this.runtimeAlias}.Slots prop=${JSON.stringify(prop)}>
                  ${existingProp ? this.renderJsxContent(existingProp) : ''}
                </${this.runtimeAlias}.Slots>
              `,
            };
          } else if (argType.control?.type === 'slot') {
            const existingProp = result[prop];

            result[prop] = {
              type: 'jsxElement',
              value: `
                <${this.runtimeAlias}.Placeholder prop=${JSON.stringify(prop)}>
                  ${existingProp ? this.renderJsxContent(existingProp) : ''}
                </${this.runtimeAlias}.Placeholder>
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
        type: 'binding',
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
          <${this.runtimeAlias}.RuntimeStudioNode nodeId="${node.id}">
            ${rendered}
          </${this.runtimeAlias}.RuntimeStudioNode>
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
   * Adds an import to the page module. Returns an identifier that's based on [suggestedName] that can
   * be used to reference the import.
   */
  addImport(
    source: string,
    imported: '*' | 'default' | string,
    suggestedName: string = imported,
  ): string {
    return this.imports.add(source, imported, suggestedName);
  }

  renderStateHooks(): string {
    return Object.values(this.useStateHooks)
      .map((state) => {
        if (!state) {
          return '';
        }
        const defaultValue = JSON.stringify(state.defaultValue);
        return `const [${state.state}, ${state.setState}] = ${this.reactAlias}.useState(${defaultValue});`;
      })
      .join('\n');
  }

  renderDataLoaderHooks(): string {
    if (this.dataLoaders.length <= 0) {
      return '';
    }

    const useDataQuery = this.addImport('@mui/studio-core', 'useDataQuery', 'useDataQuery');
    return this.dataLoaders
      .map(
        ({ queryId, variable }) =>
          `const ${variable} = ${useDataQuery}(${JSON.stringify(queryId)});`,
      )
      .join('\n');
  }

  render() {
    this.collectState();
    const root: string = this.renderRoot(this.page);
    const stateHooks = this.renderStateHooks();
    const dataQueryHooks = this.renderDataLoaderHooks();

    this.imports.seal();

    const imports = this.imports.render();

    return `
      ${imports}

      export default function App () {
        ${stateHooks}
        ${dataQueryHooks}
        return (
          ${root}
        );
      }
    `;
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
  let code: string = ctx.render();

  console.log(code);

  if (config.pretty) {
    code = prettier.format(code, {
      parser: 'babel-ts',
      plugins: [parserBabel],
    });
  }

  return { code };
}
