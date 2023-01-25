import * as React from 'react';
import { createComponent, TemplateRenderer } from '@mui/toolpad-core';
import { Box, List as MuiList, ListItem, SxProps } from '@mui/material';
import { SX_PROP_HELPER_TEXT } from './constants';

export type ListProps = {
  itemCount: number;
  disablePadding?: boolean;
  renderItem: TemplateRenderer;
  sx?: SxProps;
};

function List({ itemCount, renderItem, disablePadding = false, sx }: ListProps) {
  return (
    <MuiList disablePadding={disablePadding} sx={{ width: '100%', ...sx }}>
      {[...Array(itemCount).keys()].map((index) => (
        <ListItem key={index} disablePadding={disablePadding}>
          <Box sx={{ width: '100%', p: 0, m: 0 }}>{renderItem({ i: index })}</Box>
        </ListItem>
      ))}
    </MuiList>
  );
}

export default createComponent(List, {
  layoutDirection: 'both',
  argTypes: {
    itemCount: {
      helperText: 'Number of items to render.',
      typeDef: { type: 'number' },
      defaultValue: 3,
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
