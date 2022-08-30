import { Grid, Typography, Button } from '@mui/material';
import * as React from 'react';
import CreatePageNodeDialog from './HierarchyExplorer/CreatePageNodeDialog';

export interface NoPageFoundProps {
  appId: string;
}
export default function NoPageFound({ appId }: NoPageFoundProps) {
  const [createPageDialogOpen, setCreatePageDialogOpen] = React.useState(0);
  const handleCreatePageDialogOpen = React.useCallback(
    () => setCreatePageDialogOpen(Math.random()),
    [],
  );
  const handleCreatepageDialogClose = React.useCallback(() => setCreatePageDialogOpen(0), []);

  return (
    <Grid
      container
      sx={{ minHeight: '100%', m: 1 }}
      spacing={1}
      justifyContent="center"
      alignItems="center"
      direction="column"
    >
      <Grid item>
        <Typography variant="h6">No pages in this app.</Typography>
      </Grid>
      <Grid item>
        <Button variant="outlined" color="inherit" onClick={handleCreatePageDialogOpen}>
          Create new
        </Button>
      </Grid>
      <CreatePageNodeDialog
        key={createPageDialogOpen || undefined}
        appId={appId}
        open={!!createPageDialogOpen}
        onClose={handleCreatepageDialogClose}
      />
    </Grid>
  );
}
