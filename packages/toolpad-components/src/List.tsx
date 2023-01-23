import * as React from 'react';
import { createComponent, TemplateRenderer } from '@mui/toolpad-core';
import { Box, List as MuiList, ListItem, SxProps } from '@mui/material';
import { SX_PROP_HELPER_TEXT } from './constants';

export type ListProps = {
  items: Record<string, unknown>[];
  disablePadding?: boolean;
  renderItem: TemplateRenderer;
  sx?: SxProps;
};

function List({ items, renderItem, disablePadding = false, sx }: ListProps) {
  return (
    <MuiList disablePadding={disablePadding} sx={{ width: '100%', ...sx }}>
      {items.map((item, index) => (
        <ListItem key={index} disablePadding={disablePadding}>
          <Box sx={{ width: '100%', p: 0, m: 0 }}>{renderItem({ item, i: index })}</Box>
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
    renderItem: {
      typeDef: { type: 'template' },
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
