import { ArgTypeDefinitions } from '@mui/studio-core';
import { StudioElementNode } from '../studioDom';
import { RenderContext, ResolvedProps } from '../types';

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
}
