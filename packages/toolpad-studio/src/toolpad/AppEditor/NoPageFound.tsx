import { Grid, Typography, Button } from '@mui/material';
import * as React from 'react';
import useBoolean from '@mui/toolpad-utils/hooks/useBoolean';
import CreatePageNodeDialog from './PagesExplorer/CreatePageNodeDialog';

export default function NoPageFound() {
  const {
    value: createPageDialogOpen,
    setTrue: handleCreatePageDialogOpen,
    setFalse: handleCreatepageDialogClose,
  } = useBoolean(false);

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
      <CreatePageNodeDialog open={!!createPageDialogOpen} onClose={handleCreatepageDialogClose} />
    </Grid>
  );
}
