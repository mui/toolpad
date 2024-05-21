import * as React from 'react';
import { styled } from '@mui/material';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import HelpIcon from '@mui/icons-material/Help';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ResolvedFields } from '../DataProvider';
import { DialogProps, useDialogs } from '../useDialogs';

const COPY_BUTTON_CLASS = 'copy-button';

const Pre = styled('pre')(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  position: 'relative',
  [`& .${COPY_BUTTON_CLASS}`]: {
    display: 'none',
  },
  [`&:hover .${COPY_BUTTON_CLASS}`]: {
    display: 'flex',
  },
}));

const CopyButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
}));

function CodeSnippet({ children }: { children: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
  };
  return (
    <Pre>
      {children}
      <CopyButton size="small" className="copy-button" onClick={handleCopy}>
        <ContentCopyIcon fontSize="inherit" />
      </CopyButton>
    </Pre>
  );
}

const INFERENCING_DOCS_URL = 'https://mui.com/toolpad/core/components/data-grid#inferencing';

interface InferrenceDialogPayload {
  fields: ResolvedFields<any>;
}

function InferencingDialog({ open, onClose, payload }: DialogProps<InferrenceDialogPayload>) {
  const snippet = React.useMemo(() => {
    const serializedFields = Object.entries(payload.fields).map(([field, def]) => {
      return `  ${field}: { type: '${def.type}' },`;
    });
    const text = `fields: {\n${serializedFields.join('\n')}\n}`;
    return text;
  }, [payload.fields]);

  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Inferred fields</DialogTitle>
      <DialogContent>
        This data grid gets its data from a Toolpad data provider. As the data provider is missing
        definitions for fields, this grid inferred a default set of fields. These fields are not
        visible in production. To bake these fields into the data provider, copy the following
        snippet into the data provider definition:
        <CodeSnippet>{snippet}</CodeSnippet>
        Read more about inferencing in the <a href={INFERENCING_DOCS_URL}>docs</a>.
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export interface InferencingDialogProps {
  fields: ResolvedFields<any>;
}

export default function InferencingAlert({ fields }: InferencingDialogProps) {
  const dialogs = useDialogs();
  return (
    <Alert
      severity="warning"
      action={
        <IconButton
          color="inherit"
          size="small"
          onClick={async () => {
            await dialogs.open(InferencingDialog, { fields });
          }}
        >
          <HelpIcon />
        </IconButton>
      }
    >
      The fields for this grid were <a href={INFERENCING_DOCS_URL}>inferenced</a>.
    </Alert>
  );
}
