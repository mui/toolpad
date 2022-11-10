import * as React from 'react';
import { styled, SxProps, Skeleton, Box, Divider } from '@mui/material';
import HierarchyExplorer from './HierarchyExplorer';
import client from '../../api';
import { useDom } from '../DomLoader';
import AppOptions from '../AppOptions';
import AppNameEditable from '../AppOptions/AppNameEditable';

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
  const [editingName, setEditingName] = React.useState<boolean>(false);
  const dom = useDom();

  const { data: existingAppNames } = client.useQuery('getAppNames', []);

  const handleRename = React.useCallback(() => {
    setEditingName(true);
  }, []);

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
        {isLoading || !app ? (
          <Skeleton variant="text" width={70} />
        ) : (
          <AppNameEditable
            app={app}
            editing={editingName}
            setEditing={setEditingName}
            loading={Boolean(!app)}
            existingAppNames={existingAppNames}
          />
        )}
        {app ? (
          <AppOptions
            app={app}
            dom={dom}
            existingAppNames={existingAppNames}
            allowDelete
            redirectOnDelete
            allowDuplicate
            onRename={handleRename}
          />
        ) : null}
      </Box>
      <Divider />
      <HierarchyExplorer appId={appId} />
    </PagePanelRoot>
  );
}
