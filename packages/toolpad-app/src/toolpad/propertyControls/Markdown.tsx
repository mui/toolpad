import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  PaperProps,
  Skeleton,
} from '@mui/material';
import * as React from 'react';
import Draggable from 'react-draggable';
import type { EditorProps } from '../../types';
import useShortcut from '../../utils/useShortcut';
import lazyComponent from '../../utils/lazyComponent';

function DraggablePaperComponent(props: PaperProps) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

const MarkdownEditor = lazyComponent(() => import('../../components/MarkdownEditor'), {
  noSsr: true,
  fallback: <Skeleton variant="rectangular" height="100%" />,
});

function MarkdownPropEditor({ value, onChange }: EditorProps<any>) {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  useShortcut({ key: 's', metaKey: true, disabled: !dialogOpen }, () => {
    setDialogOpen(false);
  });

  return (
    <React.Fragment>
      <Button variant="outlined" color="inherit" fullWidth onClick={() => setDialogOpen(true)}>
        Edit Markdown
      </Button>
      <Dialog
        fullWidth
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        PaperComponent={DraggablePaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle id="draggable-dialog-title">Edit Markdown</DialogTitle>
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
