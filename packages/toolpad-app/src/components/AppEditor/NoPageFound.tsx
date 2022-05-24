import { Box, Alert, AlertColor, Button } from '@mui/material';
import * as React from 'react';
import CreatePageNodeDialog from './HierarchyExplorer/CreatePageNodeDialog';

export interface NoPageFoundProps {
  appId: string;
  message: string;
  alertSeverity?: AlertColor;
}
export default function NotFoundEditor({ appId, message, alertSeverity }: NoPageFoundProps) {
  const [createPageDialogOpen, setCreatePageDialogOpen] = React.useState(0);
  const handleCreatePageDialogOpen = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setCreatePageDialogOpen(Math.random());
  }, []);
  const handleCreatepageDialogClose = React.useCallback(() => setCreatePageDialogOpen(0), []);
  return (
    <Box
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <Alert
        severity={alertSeverity ?? 'warning'}
        action={
          <Button color="inherit" size="small" onClick={handleCreatePageDialogOpen}>
            Create new
          </Button>
        }
      >
        {message}
      </Alert>
      <CreatePageNodeDialog
        key={createPageDialogOpen || undefined}
        appId={appId}
        open={!!createPageDialogOpen}
        onClose={handleCreatepageDialogClose}
      />
    </Box>
  );
}
