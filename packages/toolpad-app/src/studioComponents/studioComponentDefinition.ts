import { ArgTypeDefinitions } from '../../../toolpad-core/dist';
import { StudioDom, StudioElementNode } from '../studioDom';
import { PropExpression, ResolvedProps } from '../types';

export interface RenderContext {
  dom: StudioDom;
  addImport(source: string, imported: string, local: string): string;
  addCodeComponentImport(source: string, local: string): string;
  renderProps(resolvedProps: ResolvedProps): string;
  renderJsExpression(expr?: PropExpression): string;
  renderJsxContent(expr?: PropExpression): string;
}

export type RenderComponent = (
  ctx: RenderContext,
  node: StudioElementNode,
  resolvedProps: ResolvedProps,
) => string;

export interface StudioComponentDefinition {
  id: string;
  displayName: string;
  argTypes: ArgTypeDefinitions;
  render: RenderComponent;
  extraControls?: Partial<Record<string, { type: string }>>;
}
