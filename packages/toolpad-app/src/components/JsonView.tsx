import * as React from 'react';
import { SxProps, styled, IconButton, Tooltip, Snackbar } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import clsx from 'clsx';
import ObjectInspector, { ObjectInspectorProps } from './ObjectInspector';

const classes = {
  viewport: 'Toolpad_ObjectInspectorViewport',
  copyToClipboardButton: 'Toolpad_CopyToClipboardButton',
  disabled: 'Toolpad_ObjectInspectorDisabled',
};

const JsonViewRoot = styled('div')(({ theme }) => ({
  whiteSpace: 'nowrap',
  position: 'relative',
  display: 'flex',
  minHeight: 0,
  minWidth: 0,

  [`&.${classes.disabled}`]: {
    opacity: 0.5,
    pointerEvents: 'none',
  },

  [`& .${classes.viewport}`]: {
    overflow: 'auto',
    flex: 1,
    padding: theme.spacing(1),
  },

  [`& .${classes.copyToClipboardButton}`]: {
    position: 'absolute',
    top: 0,
    right: 0,
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(2),
  },

  fontSize: 12,
  lineHeight: 1.2,
  fontFamily: 'Consolas, Menlo, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
}));

export interface JsonViewProps extends ObjectInspectorProps {
  src: unknown;
  copyToClipboard?: boolean;
  disabled?: boolean;
  sx?: SxProps;
}

export default function JsonView({ src, sx, copyToClipboard, disabled, ...props }: JsonViewProps) {
  // TODO: elaborate on this to show a nice default, but avoid expanding massive amount of objects
  const expandPaths = Array.isArray(src) ? ['$', '$.0', '$.1', '$.2', '$.3', '$.4'] : undefined;

  const [confirmSnackbarOpen, setConfirmSnackbarOpen] = React.useState(false);

  const handleCopyToClipboard = React.useCallback(() => {
    window.navigator.clipboard.writeText(JSON.stringify(src, null, 2));
    setConfirmSnackbarOpen(true);
  }, [src]);

  const handleCopySnackbarClose = React.useCallback(() => setConfirmSnackbarOpen(false), []);

  return (
    <JsonViewRoot sx={sx} className={clsx({ [classes.disabled]: disabled })}>
      <React.Fragment>
        <div className={classes.viewport}>
          <ObjectInspector expandLevel={1} expandPaths={expandPaths} data={src} {...props} />
        </div>

        {copyToClipboard ? (
          <React.Fragment>
            <Tooltip title="Copy the source">
              <IconButton onClick={handleCopyToClipboard} className={classes.copyToClipboardButton}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>

            <Snackbar
              open={confirmSnackbarOpen}
              autoHideDuration={3000}
              onClose={handleCopySnackbarClose}
              message="Source Copied to clipboard"
            />
          </React.Fragment>
        ) : null}
      </React.Fragment>
    </JsonViewRoot>
  );
}
