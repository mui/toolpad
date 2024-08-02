import * as React from 'react';
import { DialogsProvider, useDialogs, DialogProps } from '@toolpad/core/useDialogs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Frame from 'docs/src/components/action/Frame';
import Paper from '@mui/material/Paper';
import { HighlightedCode } from '@mui/docs/HighlightedCode';

const code = `
function MyCustomDialog({ open, onClose }) {
  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Custom dialog</DialogTitle>
      <DialogContent>I am a custom dialog</DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Close me</Button>
      </DialogActions>
    </Dialog>
  );
}

function DemoContent() {
  const dialogs = useDialogs();
  return (
    <div>
      <Button
        onClick={async () => {          
          await dialogs.open(MyCustomDialog);          
        }}
      >
        Open custom
      </Button>
    </div>
  );
}`;

function MyCustomDialog({ open, onClose }: DialogProps) {
  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Custom dialog</DialogTitle>
      <DialogContent>I am a custom dialog</DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Close me</Button>
      </DialogActions>
    </Dialog>
  );
}

function DemoContent() {
  const dialogs = useDialogs();
  return (
    <div style={{ margin: 'auto' }}>
      <Button
        onClick={async () => {
          await dialogs.open(MyCustomDialog);
        }}
      >
        Open dialog
      </Button>
    </div>
  );
}

export default function ToolpadDialogDemo() {
  return (
    <Frame sx={{ height: '100%' }}>
      <Frame.Demo sx={{ p: 2 }}>
        <Paper
          variant="outlined"
          sx={(theme) => ({
            p: 2,
            display: 'flex',
            alignItems: 'center',
            maxWidth: '100%',
            mx: 'auto',
            bgcolor: '#FFF',
            borderRadius: '8px',
            ...theme.applyDarkStyles({
              bgcolor: 'primaryDark.900',
            }),
          })}
        >
          <DialogsProvider>
            <DemoContent />
          </DialogsProvider>
        </Paper>
      </Frame.Demo>
      <Frame.Info data-mui-color-scheme="dark" sx={{ maxHeight: 600, overflow: 'auto' }}>
        <HighlightedCode copyButtonHidden plainStyle code={code} language="jsx" />
      </Frame.Info>
    </Frame>
  );
}
