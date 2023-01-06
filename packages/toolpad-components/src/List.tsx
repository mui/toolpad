import * as React from 'react';
import { createComponent } from '@mui/toolpad-core';
import { List as MuiList, ListItem } from '@mui/material';

export type ListProps = {
  items: { key?: string; [prop: string]: any }[];
  children: React.ReactNode;
};

function List({ items, children }: ListProps) {
  return (
    <MuiList>
      {items.map((item, index) => (
        <ListItem key={item?.key || index}>{children}</ListItem>
      ))}
    </MuiList>
  );
}

export default createComponent(List, {
  layoutDirection: 'both',
  argTypes: {
    items: {
      typeDef: { type: 'object' },
      defaultValue: [...Array(3).fill({})],
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'layoutSlot' },
    },
  },
});
