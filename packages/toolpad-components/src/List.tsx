import * as React from 'react';
import { createComponent } from '@mui/toolpad-core';
import { Box, List as MuiList, ListItem, ListSubheader, SxProps } from '@mui/material';
import { SX_PROP_HELPER_TEXT } from './constants';

export type ListProps = {
  items: { key?: string; [prop: string]: any }[];
  subheader?: string;
  disablePadding?: boolean;
  children: React.ReactNode;
  sx?: SxProps;
};

function List({ items, subheader, children, disablePadding = false, sx }: ListProps) {
  return (
    <MuiList
      subheader={subheader ? <ListSubheader>{subheader}</ListSubheader> : null}
      disablePadding={disablePadding}
      sx={{ width: '100%', ...sx }}
    >
      {items.map((item, index) => (
        <ListItem key={item?.key || index} disablePadding={disablePadding}>
          <Box sx={{ width: '100%', p: 0, m: 0 }}>{children}</Box>
        </ListItem>
      ))}
    </MuiList>
  );
}

export default createComponent(List, {
  layoutDirection: 'both',
  argTypes: {
    items: {
      helperText: 'List items to render.',
      typeDef: { type: 'object' },
      defaultValue: [...Array(3).fill({})],
    },
    subheader: {
      helperText: 'The content of the subheader.',
      typeDef: { type: 'string' },
      label: 'Subheader',
    },
    disablePadding: {
      helperText: 'If true, vertical padding is removed from the list.',
      typeDef: { type: 'boolean' },
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'layoutSlot' },
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      typeDef: { type: 'object' },
    },
  },
});
