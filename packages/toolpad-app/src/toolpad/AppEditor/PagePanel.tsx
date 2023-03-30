import * as React from 'react';
import { styled, SxProps, Box, Divider, Typography } from '@mui/material';
import HierarchyExplorer from './HierarchyExplorer';
import { useDom } from '../AppState';
import AppOptions from '../AppOptions';
import config from '../../config';

const PagePanelRoot = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});

export interface ComponentPanelProps {
  className?: string;
  sx?: SxProps;
}

export default function PagePanel({ className, sx }: ComponentPanelProps) {
  const { dom } = useDom();

  return (
    <PagePanelRoot className={className} sx={sx}>
      <Box
        sx={{
          pl: 2,
          pr: 1,
          py: 1,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography noWrap>{config.projectDir?.split(/[/\\]/).pop()}</Typography>

        <AppOptions dom={dom} />
      </Box>
      <Divider />
      <HierarchyExplorer />
    </PagePanelRoot>
  );
}
