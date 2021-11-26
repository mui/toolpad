import { Box } from '@mui/material';
import React from 'react';
import type { NodeId, FlowDirection } from '../../types';
import { DATA_PROP_SLOT, DATA_PROP_SLOT_DIRECTION } from '../../constants';
import NodeContext from './NodeContext';
import RenderNodeContext from './RenderNodeContext';

export interface SlotsProps {
  name: string;
  direction: FlowDirection;
  children: NodeId[];
}

export function Slots({ children, name, direction }: SlotsProps) {
  const node = React.useContext(NodeContext);
  const renderNode = React.useContext(RenderNodeContext);

  if (!node) {
    throw new Error(`Invariant: Slot used outside of a rendered node`);
  }

  return (
    <div
      style={{ display: 'contents' }}
      {...{ [DATA_PROP_SLOT]: name, [DATA_PROP_SLOT_DIRECTION]: direction }}
    >
      {children.map((childnodeId) => renderNode(childnodeId))}
    </div>
  );
}

export interface PlaceholderProps {
  name: string;
}

export function Placeholder({ name }: PlaceholderProps) {
  return (
    <Box
      display="block"
      minHeight={40}
      minWidth={200}
      {...{
        [DATA_PROP_SLOT]: name,
      }}
    />
  );
}

export interface SlotProps {
  name: string;
  content?: NodeId | null;
}

export default function Slot({ name, content }: SlotProps) {
  const node = React.useContext(NodeContext);
  const renderNode = React.useContext(RenderNodeContext);

  if (!node) {
    throw new Error(`Invariant: Slot used outside of a rendered node`);
  }

  return content ? (
    <React.Fragment>{renderNode(content)}</React.Fragment>
  ) : (
    <Placeholder name={name} />
  );
}
