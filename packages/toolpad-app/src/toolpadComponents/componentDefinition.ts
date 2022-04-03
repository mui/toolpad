import { ArgTypeDefinitions } from '@mui/toolpad-core';
import * as appDom from '../appDom';
import { PropExpression, ResolvedProps } from '../types';

export interface RenderContext {
  dom: appDom.AppDom;
  addImport(source: string, imported: string, local: string): string;
  addCodeComponentImport(source: string, local: string): string;
  renderProps(resolvedProps: ResolvedProps): string;
  renderJsExpression(expr?: PropExpression): string;
  renderJsxContent(expr?: PropExpression): string;
}

export type RenderComponent = (
  ctx: RenderContext,
  node: appDom.ElementNode,
  resolvedProps: ResolvedProps,
) => string;

export interface ToolpadComponentDefinition {
  id: string;
  displayName: string;
  argTypes: ArgTypeDefinitions;
  render: RenderComponent;
  extraControls?: Partial<Record<string, { type: string }>>;
}
