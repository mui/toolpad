import * as React from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import JsonView from '../../components/JsonView';

interface AppExportDialogProps {
  open: boolean;
  onClose: () => void;
  dom: any;
}

function AppExportDialog({ open, onClose, dom }: AppExportDialogProps) {
  const dialogTitleId = React.useId();

  return (
    <Dialog aria-labelledby={dialogTitleId} fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle id={dialogTitleId}>Application DOM</DialogTitle>
      <DialogContent sx={{ position: 'relative', display: 'flex', alignItems: 'stretch' }}>
        <JsonView sx={{ flex: 1 }} copyToClipboard src={dom} expandPaths={[]} expandLevel={5} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AppExportDialog;
