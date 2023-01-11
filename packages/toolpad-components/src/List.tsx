import * as React from 'react';
import { createComponent, IteratorItem, IteratorRenderer } from '@mui/toolpad-core';
import { Box, List as MuiList, ListItem, SxProps } from '@mui/material';
import { SX_PROP_HELPER_TEXT } from './constants';

export type ListProps = {
  // eslint-disable-next-line react/no-unused-prop-types
  items: IteratorItem[];
  disablePadding?: boolean;
  renderItems: IteratorRenderer;
  sx?: SxProps;
};

function List({ renderItems, disablePadding = false, sx }: ListProps) {
  return (
    <MuiList disablePadding={disablePadding} sx={{ width: '100%', ...sx }}>
      {renderItems((children, item, index) => (
        <ListItem key={index} disablePadding={disablePadding}>
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
    renderItems: {
      typeDef: { type: 'elementIterator', itemsProp: 'items' },
      control: { type: 'layoutSlot' },
    },
    disablePadding: {
      helperText: 'If true, vertical padding is removed from the list.',
      typeDef: { type: 'boolean' },
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      typeDef: { type: 'object' },
    },
  },
});
