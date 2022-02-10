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
import { getQueryNodeArgTypes } from './studioDataSources/client';

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

interface ControlledStateHook {
  stateVar: string;
  setStateVar: string;
  defaultValue?: unknown;
}

interface StateHook {
  type: 'derived' | 'api' | 'fetched';
  dependencies: string[];
  nodeId: NodeId;
  stateVar: string;
}

class Context implements RenderContext {
  private dom: studioDom.StudioDom;

  private page: studioDom.StudioPageNode;

  private editor: boolean;

  private imports: Imports;

  private moduleScope: Scope;

  private reactAlias: string = 'undefined';

  private runtimeAlias: string = 'undefined';

  private controlledStateHooks = new Map<string, ControlledStateHook>();

  private stateHooks = new Map<string, StateHook>();

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

  getNodeIdFromInterpolation(interpolation: string): NodeId | null {
    const [name] = interpolation.split('.');
    return studioDom.getNodeIdByName(this.dom, name);
  }

  collectDependentStateNodes(bindable: StudioBindable<any>): string[] {
    switch (bindable.type) {
      case 'const':
        return [];
      case 'binding': {
        const nodeId = this.getNodeIdFromInterpolation(bindable.value);
        return nodeId ? [nodeId] : [];
      }
      case 'boundExpression': {
        const parsed = bindings.parse(bindable.value);
        const interpolations = bindings.getInterpolations(parsed);
        return interpolations
          .map((interpolation) => this.getNodeIdFromInterpolation(interpolation))
          .filter(Boolean);
      }
      default:
        throw new Error(
          `Invariant: unhandled bindable type "${(bindable as StudioBindable<unknown>).type}"`,
        );
    }
  }

  collectAllDependentStateNodes(bindables: StudioBindables<any>): string[] {
    return Object.values(bindables)
      .map((bindable) => (bindable ? this.collectDependentStateNodes(bindable) : []))
      .flat();
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

      let stateHook = this.controlledStateHooks.get(stateId);
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
        const stateVar = this.moduleScope.createUniqueBinding(stateVarSuggestion);

        const setStateVarSuggestion = camelCase('set', nodeName, prop);
        const setStateVar = this.moduleScope.createUniqueBinding(setStateVarSuggestion);

        stateHook = {
          stateVar,
          setStateVar,
          defaultValue: argType.defaultValue,
        };
        this.controlledStateHooks.set(stateId, stateHook);
      }

      const resolvedExpr = [stateHook.stateVar, ...subPath].join('.');
      this.interpolations.set(interpolation, resolvedExpr);
    } else if (studioDom.isDerivedState(node)) {
      let stateHook = this.stateHooks.get(node.id);
      if (!stateHook) {
        const dependencies = this.collectAllDependentStateNodes(node.params);
        stateHook = {
          type: 'derived',
          dependencies,
          nodeId: node.id,
          stateVar: this.moduleScope.createUniqueBinding(node.name),
        };
        this.stateHooks.set(node.id, stateHook);
      }
      const resolvedExpr = [stateHook.stateVar, ...path].join('.');
      this.interpolations.set(interpolation, resolvedExpr);
    } else if (studioDom.isQueryState(node)) {
      let stateHook = this.stateHooks.get(node.id);
      if (!stateHook) {
        const dependencies = this.collectAllDependentStateNodes(node.params);
        stateHook = {
          type: 'api',
          dependencies,
          nodeId: node.id,
          stateVar: this.moduleScope.createUniqueBinding(node.name),
        };
        this.stateHooks.set(node.id, stateHook);
      }
      const resolvedExpr = [stateHook.stateVar, ...path].join('.');
      this.interpolations.set(interpolation, resolvedExpr);
    } else if (studioDom.isFetchedState(node)) {
      let stateHook = this.stateHooks.get(node.id);
      if (!stateHook) {
        const dependencies = this.collectDependentStateNodes(node.url);
        stateHook = {
          type: 'fetched',
          dependencies,
          nodeId: node.id,
          stateVar: this.moduleScope.createUniqueBinding(node.name),
        };
        this.stateHooks.set(node.id, stateHook);
      }
      const resolvedExpr = [stateHook.stateVar, ...path].join('.');
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
        const hook = this.controlledStateHooks.get(stateId);

        if (!hook) {
          return;
        }

        result[propName] = {
          type: 'expression',
          value: hook.stateVar,
        };

        if (argType.onChangeProp) {
          if (argType.onChangeHandler) {
            // TODO: React.useCallback for this?
            const { params, valueGetter } = argType.onChangeHandler;
            result[argType.onChangeProp] = {
              type: 'expression',
              value: `(${params.join(', ')}) => ${hook.setStateVar}(${valueGetter})`,
            };
          } else {
            result[argType.onChangeProp] = {
              type: 'expression',
              value: hook.setStateVar,
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

  renderControlledStateHooks(): string {
    return Array.from(this.controlledStateHooks.values(), (stateHook) => {
      const defaultValue = JSON.stringify(stateHook.defaultValue);
      return `const [${stateHook.stateVar}, ${stateHook.setStateVar}] = ${this.reactAlias}.useState(${defaultValue});`;
    }).join('\n');
  }

  renderStateHooks(): string {
    const orderedHooks: StateHook[] = [];
    const seenHooks = new Set<string>();

    const addHook = (id: string, history: string[] = []): void => {
      const hook = this.stateHooks.get(id);
      if (!hook) {
        return;
      }
      if (history.includes(id)) {
        throw new Error(`Cyclic state detected`);
      }
      if (hook.dependencies) {
        hook.dependencies.forEach((depId) => addHook(depId, [...history, id]));
      }
      if (!seenHooks.has(id)) {
        orderedHooks.push(hook);
        seenHooks.add(id);
      }
    };

    // Sort hooks according to their deprendencies
    [...this.stateHooks.keys()].forEach((nodeId) => addHook(nodeId));

    return orderedHooks
      .map((stateHook) => {
        switch (stateHook.type) {
          case 'derived': {
            const node = studioDom.getNode(this.dom, stateHook.nodeId, 'derivedState');
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
            return `const ${
              stateHook.stateVar
            } = React.useMemo(() => ${derivedStateGetter}(${paramsArg}), [${depsArray.join(
              ', ',
            )}])`;
          }
          case 'api': {
            const node = studioDom.getNode(this.dom, stateHook.nodeId, 'queryState');
            const propTypes = argTypesToPropValueTypes(getQueryNodeArgTypes(this.dom, node));
            const resolvedProps = this.resolveBindables(node.params, propTypes);
            const params = this.renderPropsAsObject(resolvedProps);

            const useDataQuery = this.addImport('@mui/studio-core', 'useDataQuery', 'useDataQuery');

            return `const ${stateHook.stateVar} = ${useDataQuery}(${JSON.stringify(
              node.api,
            )}, ${params});`;
          }
          case 'fetched': {
            const node = studioDom.getNode(this.dom, stateHook.nodeId, 'fetchedState');

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

            return `const ${stateHook.stateVar} = ${useFetchedState}(${paramsExpr});`;
          }
          default:
            throw new Error(
              `Invariant: Missing renderer for state hook of type "${
                (stateHook as StateHook).type
              }"`,
            );
        }
      })
      .join('\n');
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

  render() {
    this.collectAllState();
    const root: string = this.renderRoot(this.page);
    const controlledState = this.renderControlledStateHooks();
    const state = this.renderStateHooks();

    this.imports.seal();

    const imports = this.imports.render();

    return `
      ${imports}

      export default function App () {
        ${controlledState}
        ${state}

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
