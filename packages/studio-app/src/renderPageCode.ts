import { ArgTypeDefinitions, PropValueTypes } from '@mui/studio-core';
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
  StudioBindable,
  StudioBindables,
} from './types';
import { camelCase } from './utils/strings';
import { ExactEntriesOf } from './utils/types';
import * as bindings from './utils/bindings';

function literalPropExpression(value: any): PropExpression {
  return {
    type: 'expression',
    value: JSON.stringify(value),
  };
}

function argTypesToPropValueTypes(argTypes: ArgTypeDefinitions): PropValueTypes {
  return Object.fromEntries(
    Object.entries(argTypes).flatMap(([propName, argType]) =>
      argType ? [[propName, argType.typeDef]] : [],
    ),
  );
}

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

  private reactAlias: string = 'undefined';

  private runtimeAlias: string = 'undefined';

  private useStateHooks = new Map<
    string,
    { state: string; setState: string; defaultValue?: unknown }
  >();

  private useMemoHooks = new Map<string, string>();

  private useQueryHooks = new Map<string, string>();

  private useFetchedStateHooks = new Map<string, string>();

  // Resolves a named interpolation in a binding expression into an expression available on the page
  private interpolations = new Map<string, string>();

  constructor(
    dom: studioDom.StudioDom,
    page: studioDom.StudioPageNode,
    { editor }: RenderPageConfig,
  ) {
    this.dom = dom;
    this.page = page;
    this.editor = editor;

    this.moduleScope = new Scope(null);

    this.imports = new Imports(this.moduleScope);

    this.reactAlias = this.addImport('react', '*', 'React');

    if (this.editor) {
      this.runtimeAlias = this.addImport('@mui/studio-core/runtime', '*', '__studioRuntime');
    }
  }

  useDataLoader(queryId: string): string {
    const variable = this.moduleScope.createUniqueBinding(queryId);
    this.dataLoaders.push({ queryId, variable });
    return variable;
  }

  collectAllState() {
    const nodes = studioDom.getDescendants(this.dom, this.page);
    nodes.forEach((node) => {
      if (studioDom.isElement(node)) {
        this.collectBindablePropsState(node.props);
      } else if (studioDom.isDerivedState(node) || studioDom.isQueryState(node)) {
        this.collectBindablePropsState(node.params);
      }
    });
  }

  collectBindablePropsState(props: StudioBindables<any>) {
    Object.values(props).forEach((prop) => {
      if (prop) {
        this.collectBindablePropState(prop);
      }
    });
  }

  collectBindablePropState(prop: StudioBindable<unknown>) {
    if (prop?.type === 'boundExpression') {
      const parsedExpr = bindings.parse(prop.value);
      bindings
        .getInterpolations(parsedExpr)
        .forEach((interpolation) => this.collectInterpolation(interpolation));
    } else if (prop?.type === 'binding') {
      this.collectInterpolation(prop.value);
    }
  }

  collectInterpolation(interpolation: string) {
    const [nodeName, ...path] = interpolation.split('.');
    const nodeId = studioDom.getNodeIdByName(this.dom, nodeName);

    if (!nodeId) {
      console.warn(`Can't find node with name "${nodeName}"`);
      return;
    }

    const node = studioDom.getNode(this.dom, nodeId);

    if (studioDom.isElement(node)) {
      const [prop, ...subPath] = path;

      const stateId = `${nodeId}.${prop}`;

      let stateHook = this.useStateHooks.get(stateId);
      if (!stateHook) {
        const component = getStudioComponent(this.dom, node.component);

        const argType = component.argTypes[prop];

        if (!argType) {
          throw new Error(`Can't find argType for "${node.name}.${prop}"`);
        }

        if (!argType.onChangeHandler) {
          throw new Error(`"${node.name}.${prop}" is not a controlled property`);
        }

        const stateVarSuggestion = camelCase(nodeName, prop);
        const state = this.moduleScope.createUniqueBinding(stateVarSuggestion);

        const setStateVarSuggestion = camelCase('set', nodeName, prop);
        const setState = this.moduleScope.createUniqueBinding(setStateVarSuggestion);

        stateHook = {
          state,
          setState,
          defaultValue: argType.defaultValue,
        };
        this.useStateHooks.set(stateId, stateHook);
      }

      const resolvedExpr = [stateHook.state, ...subPath].join('.');
      this.interpolations.set(interpolation, resolvedExpr);
    } else if (studioDom.isDerivedState(node)) {
      let state = this.useMemoHooks.get(node.id);
      if (!state) {
        state = this.moduleScope.createUniqueBinding(node.name);
        this.useMemoHooks.set(node.id, state);
      }
      const resolvedExpr = [state, ...path].join('.');
      this.interpolations.set(interpolation, resolvedExpr);
    } else if (studioDom.isQueryState(node)) {
      let state = this.useQueryHooks.get(node.id);
      if (!state) {
        state = this.moduleScope.createUniqueBinding(node.name);
        this.useQueryHooks.set(node.id, state);
      }
      const resolvedExpr = [state, ...path].join('.');
      this.interpolations.set(interpolation, resolvedExpr);
    } else if (studioDom.isFetchedState(node)) {
      let state = this.useFetchedStateHooks.get(node.id);
      if (!state) {
        state = this.moduleScope.createUniqueBinding(node.name);
        this.useFetchedStateHooks.set(node.id, state);
      }
      const resolvedExpr = [state, ...path].join('.');
      this.interpolations.set(interpolation, resolvedExpr);
    }
  }

  resolveBindable<P extends studioDom.BindableProps<P>>(
    propValue: StudioBindable<any>,
  ): PropExpression {
    if (propValue.type === 'const') {
      return {
        type: 'expression',
        value: JSON.stringify(propValue.value),
      };
    }

    if (propValue.type === 'boundExpression') {
      const parsedExpr = bindings.parse(propValue.value);

      // Resolve each named variable to its resolved variable in code
      const resolvedExpr = bindings.resolve(
        parsedExpr,
        (part) => this.interpolations.get(part) ?? 'undefined',
      );

      const value = bindings.formatExpression(resolvedExpr, propValue.format);

      return {
        type: 'expression',
        value,
      };
    }

    if (propValue.type === 'binding') {
      return {
        type: 'expression',
        value: this.interpolations.get(propValue.value) ?? 'undefined',
      };
    }

    console.warn(`Invariant: Unkown prop type "${(propValue as any).type}"`);
    return {
      type: 'expression',
      value: JSON.stringify(undefined),
    };
  }

  /**
   * Resolves StudioBindables to expressions we can render in the code.
   */
  resolveBindables(bindables: StudioBindables<any>, propTypes: PropValueTypes): ResolvedProps {
    const result: ResolvedProps = {};

    Object.entries(bindables).forEach(([propName, propValue]) => {
      const propType = propTypes[propName as string];
      if (propValue && propType) {
        const resolved = this.resolveBindable(propValue);
        if (resolved) {
          result[propName] = resolved;
        }
      }
    });

    return result;
  }

  resolveElementProps(node: studioDom.StudioElementNode): ResolvedProps {
    const component = getStudioComponent(this.dom, node.component);
    const propTypes = argTypesToPropValueTypes(component.argTypes);

    const result: ResolvedProps = this.resolveBindables(node.props, propTypes);

    // useState Hooks
    if (component) {
      Object.entries(component.argTypes).forEach(([propName, argType]) => {
        if (!argType) {
          return;
        }

        const stateId = `${node.id}.${propName}`;
        const hook = this.useStateHooks.get(stateId);

        if (!hook) {
          return;
        }

        result[propName] = {
          type: 'expression',
          value: hook.state,
        };

        if (argType.onChangeProp) {
          if (argType.onChangeHandler) {
            // TODO: React.useCallback for this?
            const { params, valueGetter } = argType.onChangeHandler;
            result[argType.onChangeProp] = {
              type: 'expression',
              value: `(${params.join(', ')}) => ${hook.setState}(${valueGetter})`,
            };
          } else {
            result[argType.onChangeProp] = {
              type: 'expression',
              value: hook.setState,
            };
          }
        }
      });
    }

    // Default values
    if (component) {
      Object.entries(component.argTypes).forEach(([propName, argType]) => {
        if (argType && argType.defaultValue !== undefined && !result[propName]) {
          const defaultPropName = argType.defaultValueProp ?? propName;
          result[defaultPropName] = {
            type: 'expression',
            value: JSON.stringify(argType.defaultValue),
          };
        }
      });
    }

    return result;
  }

  renderComponentChildren(
    component: StudioComponentDefinition,
    renderableNodeChildren: { [key: string]: studioDom.StudioElementNode<any>[] },
  ): ResolvedProps {
    const result: ResolvedProps = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const [prop, children] of Object.entries(renderableNodeChildren)) {
      if (children) {
        if (children.length === 1) {
          result[prop] = this.renderElement(children[0]);
        } else if (children.length > 1) {
          result[prop] = {
            type: 'jsxFragment',
            value: children
              .map((child): string => this.renderJsxContent(this.renderElement(child)))
              .join('\n'),
          };
        }
      }
    }

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

  renderComponent(
    node: studioDom.StudioNode,
    component: StudioComponentDefinition,
    resolvedProps: ResolvedProps,
    resolvedChildren: ResolvedProps,
  ): PropExpression {
    const rendered = component.render(this, {
      ...resolvedProps,
      ...resolvedChildren,
    });

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

  renderElement(node: studioDom.StudioElementNode): PropExpression {
    const component = getStudioComponent(this.dom, node.component);

    const resolvedProps = studioDom.isElement(node) ? this.resolveElementProps(node) : {};
    const resolvedChildren = this.renderComponentChildren(
      component,
      studioDom.getChildNodes(this.dom, node),
    );

    return this.renderComponent(node, component, resolvedProps, resolvedChildren);
  }

  /**
   * Renders a node to a string that can be inlined as the return value of a React component
   * @example
   * `function Hello () {
   *   return ${RESULT};
   * }`
   */
  renderRoot(node: studioDom.StudioPageNode): string {
    const component = getStudioComponent(this.dom, 'Page');
    const { children } = studioDom.getChildNodes(this.dom, node);
    const resolvedChildren = this.renderComponentChildren(component, { children });
    const expr = this.renderComponent(node, component, {}, resolvedChildren);
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
        return `${name}={${this.renderJsExpression(expr)}}`;
      })
      .join(' ');
  }

  /**
   * Renders resolved properties to a string that can be inlined as a JS object
   * @example
   *     `const hello = ${RESULT}`;
   *     // "const hello = { foo: 'bar' }"
   */
  renderPropsAsObject(resolvedProps: ResolvedProps): string {
    const keyValuePairs = (Object.entries(resolvedProps) as ExactEntriesOf<ResolvedProps>).map(
      ([name, expr]) => {
        if (!expr) {
          return '';
        }
        return `${name}: ${this.renderJsExpression(expr)}`;
      },
    );
    return `{${keyValuePairs.join(', ')}}`;
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
    return Array.from(this.useStateHooks.values(), (state) => {
      if (!state) {
        return '';
      }
      const defaultValue = JSON.stringify(state.defaultValue);
      return `const [${state.state}, ${state.setState}] = ${this.reactAlias}.useState(${defaultValue});`;
    }).join('\n');
  }

  renderDerivedStateHooks(): string {
    return Array.from(this.useMemoHooks.entries(), ([nodeId, stateVar]) => {
      if (stateVar) {
        const node = studioDom.getNode(this.dom, nodeId as NodeId, 'derivedState');
        const resolvedParams = this.resolveBindables(node.params, node.argTypes);
        const paramsArg = this.renderPropsAsObject(resolvedParams);
        const depsArray = Object.values(resolvedParams).map((resolvedProp) =>
          this.renderJsExpression(resolvedProp),
        );
        const derivedStateGetter = this.addImport(
          `../derivedState/${node.id}.ts`,
          'default',
          node.name,
        );
        return `const ${stateVar} = React.useMemo(() => ${derivedStateGetter}(${paramsArg}), [${depsArray.join(
          ', ',
        )}])`;
      }
      return '';
    }).join('\n');
  }

  renderQueryStateHooks(): string {
    return Array.from(this.useQueryHooks.entries(), ([nodeId, stateVar]) => {
      if (stateVar) {
        const node = studioDom.getNode(this.dom, nodeId as NodeId, 'queryState');

        const apiNode = node.api ? studioDom.getNode(this.dom, node.api, 'api') : null;

        const propTypes = apiNode ? argTypesToPropValueTypes(apiNode.argTypes) : {};

        const resolvedProps = this.resolveBindables(node.params, propTypes);

        // TODO: Set up variable binding
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const params = this.renderPropsAsObject(resolvedProps);
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const depsArray = Object.values(resolvedProps).map((resolvedProp) =>
          this.renderJsExpression(resolvedProp),
        );

        const useDataQuery = this.addImport('@mui/studio-core', 'useDataQuery', 'useDataQuery');
        return `const ${stateVar} = ${useDataQuery}(${JSON.stringify(node.api)});`;
      }
      return '';
    }).join('\n');
  }

  renderFetchedStateHooks(): string {
    return Array.from(this.useFetchedStateHooks.entries(), ([nodeId, stateVar]) => {
      if (stateVar) {
        const node = studioDom.getNode(this.dom, nodeId as NodeId, 'fetchedState');

        const url = this.resolveBindable(node.url);

        const paramsExpr = this.renderPropsAsObject({
          url,
          collectionPath: literalPropExpression(node.collectionPath),
          fieldPaths: literalPropExpression(node.fieldPaths),
        });

        const useFetchedState = this.addImport(
          '@mui/studio-core',
          'useFetchedState',
          'useFetchedState',
        );

        return `const ${stateVar} = ${useFetchedState}(${paramsExpr});`;
      }
      return '';
    }).join('\n');
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
    this.collectAllState();
    const root: string = this.renderRoot(this.page);
    const stateHooks = this.renderStateHooks();
    const derivedStateHooks = this.renderDerivedStateHooks();
    const queryStateHooks = this.renderQueryStateHooks();
    const fetchdStateHooks = this.renderFetchedStateHooks();
    const dataQueryHooks = this.renderDataLoaderHooks();

    this.imports.seal();

    const imports = this.imports.render();

    return `
      ${imports}

      export default function App () {
        ${stateHooks}
        ${dataQueryHooks}
        ${derivedStateHooks}
        ${queryStateHooks}
        ${fetchdStateHooks}

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

  const page = studioDom.getNode(dom, pageNodeId, 'page');

  const ctx = new Context(dom, page, config);
  let code: string = ctx.render();

  if (config.pretty) {
    code = prettier.format(code, {
      parser: 'babel-ts',
      plugins: [parserBabel],
    });
  }

  return { code };
}
