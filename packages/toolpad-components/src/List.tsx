import * as React from 'react';
import { TemplateRenderer } from '@mui/toolpad-core';
import { Box, List as MuiList, ListItem, SxProps } from '@mui/material';
import { SX_PROP_HELPER_TEXT } from './constants';
import createBuiltin from './createBuiltin';

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
          <Box sx={{ width: '100%', p: 0, m: 0 }}>{renderItem(`item-${index}`, { i: index })}</Box>
        </ListItem>
      ))}
    </MuiList>
  );
}

export default createBuiltin(List, {
  helperText: 'A list component.',
  argTypes: {
    itemCount: {
      helperText: 'Number of items to render.',
      type: 'number',
      default: 3,
    },
    renderItem: {
      helperText: 'List item template to render.',
      type: 'template',
      control: { type: 'layoutSlot' },
    },
    disablePadding: {
      helperText: 'If true, vertical padding is removed from the list.',
      type: 'boolean',
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      type: 'object',
    },
  },
});
