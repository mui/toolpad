import * as React from 'react';
import { styled, SxProps, Skeleton, Box, Divider } from '@mui/material';
import HierarchyExplorer from './HierarchyExplorer';
import client from '../../api';
import type { AppMeta } from '../../server/data';
import { useDom } from '../DomLoader';
import AppOptions from '../AppOptions';
import AppNameEditable from '../AppOptions/AppNameEditable';
import AppDeleteDialog from '../AppOptions/AppDeleteDialog';
import AppDuplicateDialog from '../AppOptions/AppDuplicateDialog';

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
  const [deletedApp, setDeletedApp] = React.useState<null | AppMeta>(null);
  const [duplicateApp, setDuplicateApp] = React.useState<null | AppMeta>(null);
  const dom = useDom();

  const handleRename = React.useCallback(() => {
    setEditingName(true);
  }, []);

  const onDelete = React.useCallback(() => {
    if (app) {
      setDeletedApp(app);
    }
  }, [app]);

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
          />
        )}
        {app ? (
          <AppOptions
            app={app}
            onRename={handleRename}
            onDuplicate={() => setDuplicateApp(app)}
            onDelete={onDelete}
            dom={dom}
          />
        ) : null}
      </Box>
      <Divider />
      <AppDeleteDialog app={deletedApp} onClose={() => setDeletedApp(null)} redirectOnDelete />
      <AppDuplicateDialog
        open={Boolean(duplicateApp)}
        app={duplicateApp}
        onClose={() => setDuplicateApp(null)}
      />
      <HierarchyExplorer appId={appId} />
    </PagePanelRoot>
  );
}
