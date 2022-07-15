import { styled, SxProps, Typography, Skeleton, Box, Divider } from '@mui/material';
import * as React from 'react';
import HierarchyExplorer from './HierarchyExplorer';
import client from '../../api';

const PagePanelRoot = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});

export interface ComponentPanelProps {
  appId: string;
  className?: string;
  sx?: SxProps;
}

export default function PagePanel({ appId, className, sx }: ComponentPanelProps) {
  const { data: app, isLoading } = client.useQuery('getApp', [appId]);

  return (
    <PagePanelRoot className={className} sx={sx}>
      <Box sx={{ px: 2, py: 1 }}>
        {isLoading ? <Skeleton variant="text" /> : <Typography>{app?.name}</Typography>}
      </Box>
      <Divider />
      <HierarchyExplorer appId={appId} />
    </PagePanelRoot>
  );
}
