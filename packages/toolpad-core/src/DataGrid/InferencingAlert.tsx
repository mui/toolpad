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

const INFERENCING_DOCS_URL = 'https://mui.com/toolpad/core/react-data-grid/#column-inference';

interface InferencingDialogProps {
  open: boolean;
  onClose: () => void;
  fields: ResolvedFields<any>;
}

function InferencingDialog({ open, onClose, fields }: InferencingDialogProps) {
  const snippet = React.useMemo(() => {
    const serializedFields = Object.entries(fields).map(([field, def]) => {
      return `  ${field}: { type: '${def.type}' },`;
    });
    const text = `fields: {\n${serializedFields.join('\n')}\n}`;
    return text;
  }, [fields]);

  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Inferred fields</DialogTitle>
      <DialogContent>
        This data grid gets its data from a Toolpad data provider. As the data provider is missing
        definitions for fields, this grid inferred a default set of fields. These fields are not
        visible in production. To bake them in the data provider, copy the following snippet into
        the data provider definition:
        <CodeSnippet>{snippet}</CodeSnippet>
        Read more about inferencing in the <a href={INFERENCING_DOCS_URL}>docs</a>.
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export interface InferencingAlertProps {
  fields: ResolvedFields<any>;
}

/**
 * @ignore - internal component.
 */
export default function InferencingAlert({ fields }: InferencingAlertProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <InferencingDialog open={open} onClose={async () => setOpen(false)} fields={fields} />
      <Alert
        severity="warning"
        action={
          <IconButton
            color="inherit"
            size="small"
            onClick={() => {
              setOpen(true);
            }}
          >
            <HelpIcon />
          </IconButton>
        }
      >
        The fields for this grid were <a href={INFERENCING_DOCS_URL}>inferred</a>. Don&quot;t use in
        production.
      </Alert>
    </React.Fragment>
  );
}
