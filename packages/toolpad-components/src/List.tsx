import * as React from 'react';
import { Template, TemplateInstance, TemplateRenderer } from '@mui/toolpad-core';
import { Box, List as MuiList, ListItem, SxProps } from '@mui/material';
import { SX_PROP_HELPER_TEXT } from './constants';
import createBuiltin from './createBuiltin';

export type ListProps = {
  itemCount: number;
  disablePadding?: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
  renderItem: TemplateRenderer;
  sx?: SxProps;
};

function List({ itemCount, disablePadding = false, sx }: ListProps) {
  return (
    <MuiList disablePadding={disablePadding} sx={{ width: '100%', ...sx }}>
      {Array.from(Array(itemCount), (_, index) => (
        <ListItem key={index} disablePadding={disablePadding}>
          <Box sx={{ position: 'relative', width: '100%', p: 0, m: 0 }}>
            {index === 0 ? (
              <Template prop="renderItem" scope={{ i: index }} />
            ) : (
              <TemplateInstance prop="renderItem" scope={{ i: index }} />
            )}
          </Box>
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
      visible: false,
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
