import * as React from 'react';
import { TemplateRenderer } from '@toolpad/studio-runtime';
import { Box, List as MuiList, ListItem, SxProps, Skeleton, Stack } from '@mui/material';
import { SX_PROP_HELPER_TEXT } from './constants';
import createBuiltin from './createBuiltin';

export type ListProps = {
  itemCount: number;
  disablePadding?: boolean;
  renderItem: TemplateRenderer;
  loading?: boolean;
  sx?: SxProps;
};

function List({ itemCount, renderItem, disablePadding = false, sx, loading }: ListProps) {
  return (
    <MuiList disablePadding={disablePadding} sx={{ width: '100%', ...sx }}>
      {loading ? (
        <Stack spacing={2}>
          <Skeleton variant="rounded" />
          <Skeleton variant="rounded" />
          <Skeleton variant="rounded" />
        </Stack>
      ) : (
        [...Array(itemCount).keys()].map((index) => (
          <ListItem key={index} disablePadding={disablePadding}>
            <Box sx={{ width: '100%', p: 0, m: 0 }}>
              {renderItem(`item-${index}`, { i: index })}
            </Box>
          </ListItem>
        ))
      )}
    </MuiList>
  );
}

export default createBuiltin(List, {
  loadingPropSource: ['itemCount'],
  loadingProp: 'loading',
  helperText: 'A [List](https://mui.com/toolpad/studio/components/list/) component.',
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
    loading: {
      helperText: 'Displays a loading animation indicating the list is still loading',
      type: 'boolean',
      default: false,
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      type: 'object',
    },
  },
});
