import * as React from 'react';
import {
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Link,
  DialogActions,
  Tooltip,
  ButtonProps,
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import client from '../api';

interface OpenCodeEditorButtonProps extends ButtonProps {
  filePath: string;
  fileType: string;
  iconButton?: boolean;
}

interface MissingEditorDialogProps {
  open: boolean;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
}

function MissingEditorDialog({ open, onClose }: MissingEditorDialogProps) {
  const handleMissingEditorDialogClose = React.useCallback(() => {
    onClose(false);
  }, [onClose]);

  const id = React.useId();

  return (
    <Dialog
      open={open}
      onClose={handleMissingEditorDialogClose}
      aria-labelledby={`${id}-title`}
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id={`${id}-title`}>{'Editor not found'}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          No editor was detected on your system. If using Visual Studio Code, this may be due to a
          missing &quot;code&quot; command in your PATH. <br />
          Check the{' '}
          <Link href="https://mui.com/toolpad/how-to-guides/editor-path" target="_blank">
            docs
          </Link>{' '}
          for more information.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleMissingEditorDialogClose}>Dismiss</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function OpenCodeEditorButton({
  filePath,
  fileType,
  iconButton,
  ...rest
}: OpenCodeEditorButtonProps) {
  const [missingEditorDialog, setMissingEditorDialog] = React.useState(false);

  const handleClick = React.useCallback(
    (event: React.SyntheticEvent) => {
      event.stopPropagation();
      client.mutation.openCodeEditor(filePath, fileType).catch(() => {
        setMissingEditorDialog(true);
      });
    },
    [filePath, fileType],
  );

  return (
    <React.Fragment>
      {iconButton ? (
        <Tooltip title="Open in code editor">
          <IconButton size="small" onClick={handleClick} {...rest}>
            <CodeIcon fontSize="inherit" color="primary" />
          </IconButton>
        </Tooltip>
      ) : (
        <Button onClick={handleClick} {...rest}>
          Open
        </Button>
      )}
      <MissingEditorDialog open={missingEditorDialog} onClose={setMissingEditorDialog} />
    </React.Fragment>
  );
}
