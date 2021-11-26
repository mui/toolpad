import { Box } from '@mui/material';
import React from 'react';
import type { FlowDirection } from '../../types';
import { DATA_PROP_SLOT, DATA_PROP_SLOT_DIRECTION } from '../../constants';

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

export interface SlotsProps {
  name: string;
  direction: FlowDirection;
  children: React.ReactNode;
}

export function Slots({ children, name, direction }: SlotsProps) {
  const count = React.Children.count(children);
  const dataProps: Record<string, string> = { [DATA_PROP_SLOT]: name };
  if (count > 0) {
    dataProps[DATA_PROP_SLOT_DIRECTION] = direction;
  }
  return (
    <div style={{ display: 'contents' }} {...dataProps}>
      {count > 0 ? children : <Placeholder name={name} />}
    </div>
  );
}

export interface SlotProps {
  name: string;
  children?: React.ReactNode;
}

export default function Slot({ name, children }: SlotProps) {
  const count = React.Children.count(children);
  return count > 0 ? <React.Fragment>{children}</React.Fragment> : <Placeholder name={name} />;
}
