import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
} from '@mui/material';
import * as React from 'react';
import type { EditorProps } from '../../types';
import useShortcut from '../../utils/useShortcut';
import lazyComponent from '../../utils/lazyComponent';
import PropertyControl from '../../components/PropertyControl';

const MarkdownEditor = lazyComponent(() => import('../../components/MarkdownEditor'), {
  noSsr: true,
  fallback: <Skeleton variant="rectangular" height="100%" />,
});

function MarkdownPropEditor({ propType, value, onChange }: EditorProps<any>) {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  useShortcut({ key: 's', metaKey: true, disabled: !dialogOpen }, () => {
    setDialogOpen(false);
  });

  return (
    <React.Fragment>
      <PropertyControl propType={propType}>
        <Button variant="outlined" color="inherit" fullWidth onClick={() => setDialogOpen(true)}>
          Edit Markdown
        </Button>
      </PropertyControl>
      <Dialog fullWidth open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Edit Markdown</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 200 }}>
            <MarkdownEditor value={value} onChange={(newValue = '') => onChange(newValue)} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="text" onClick={() => setDialogOpen(false)}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default MarkdownPropEditor;
