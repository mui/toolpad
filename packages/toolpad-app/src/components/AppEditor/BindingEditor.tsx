import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import * as React from 'react';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { LiveBinding, PropValueType, BindableAttrValue } from '@mui/toolpad-core';
import { evaluateBindable, JsRuntimeProvider, useJsRuntime } from '@mui/toolpad-core/runtime';
import evaluateBindableServer from '../../server/evaluateBindable';
import { WithControlledProp } from '../../utils/types';
import { JsExpressionEditor } from './PageEditor/JsExpressionEditor';
import JsonView from '../JsonView';
import { tryFormatExpression } from '../../utils/prettier';
import useLatest from '../../utils/useLatest';
import useDebounced from '../../utils/useDebounced';
import { Json } from '../../server/evalExpression';

interface JsExpressionBindingEditorProps<V>
  extends WithControlledProp<BindableAttrValue<V> | null> {
  globalScope: Record<string, unknown>;
  onCommit?: () => void;
}

function JsExpressionBindingEditor<V>({
  globalScope,
  value,
  onChange,
  onCommit,
}: JsExpressionBindingEditorProps<V>) {
  const handleChange = React.useCallback(
    (newValue: string) => onChange({ type: 'jsExpression', value: newValue }),
    [onChange],
  );

  return (
    <JsExpressionEditor
      globalScope={globalScope}
      value={value?.type === 'jsExpression' ? value.value : ''}
      onChange={handleChange}
      onCommit={onCommit}
    />
  );
}

interface JsExpressionPreviewProps {
  input: BindableAttrValue<unknown> | null;
  globalScope: Record<string, unknown>;
}

function JsExpressionPreview({ input, globalScope }: JsExpressionPreviewProps) {
  const previewValue: LiveBinding = React.useMemo(
    () => evaluateBindable(input, globalScope),
    [input, globalScope],
  );

  const lastGoodPreview = useLatest(previewValue?.error ? undefined : previewValue);
  const previewErrorDebounced = useDebounced(previewValue?.error, 500);
  const previewError = previewValue?.error && previewErrorDebounced;

  return (
    <React.Fragment>
      <Toolbar variant="dense" disableGutters>
        <Typography color="error">{previewError?.message}</Typography>
      </Toolbar>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <JsonView src={lastGoodPreview?.value} />
      </Box>
    </React.Fragment>
  );
}

interface JsExpressionPreviewProps {
  input: BindableAttrValue<unknown> | null;
  globalScope: Record<string, unknown>;
}

function JsExpressionPreviewServerContent({ input, globalScope }: JsExpressionPreviewProps) {
  const jsRuntime = useJsRuntime();

  const previewValue: LiveBinding = React.useMemo(() => {
    const ctx = jsRuntime.newContext();
    try {
      return evaluateBindableServer(ctx, input, globalScope as Record<string, Json>);
    } finally {
      ctx.dispose();
    }
  }, [jsRuntime, input, globalScope]);

  const lastGoodPreview = useLatest(previewValue?.error ? undefined : previewValue);
  const previewErrorDebounced = useDebounced(previewValue?.error, 500);
  const previewError = previewValue?.error && previewErrorDebounced;

  return (
    <React.Fragment>
      <Toolbar variant="dense" disableGutters>
        <Typography color="error">{previewError?.message}</Typography>
      </Toolbar>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <JsonView src={lastGoodPreview?.value} />
      </Box>
    </React.Fragment>
  );
}

function JsExpressionPreviewServer(props: JsExpressionPreviewProps) {
  return (
    <React.Suspense fallback="loading...">
      <JsRuntimeProvider>
        <JsExpressionPreviewServerContent {...props} />
      </JsRuntimeProvider>
    </React.Suspense>
  );
}

export interface BindingEditorProps<V> extends WithControlledProp<BindableAttrValue<V> | null> {
  globalScope: Record<string, unknown>;
  /**
   * Uses the QuickJs runtime to evaluate bindings, just like on the server
   */
  server?: boolean;
  disabled?: boolean;
  propType: PropValueType;
}

export function BindingEditor<V>({
  globalScope,
  server,
  disabled,
  propType,
  value,
  onChange,
}: BindingEditorProps<V>) {
  const [input, setInput] = React.useState(value);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setInput(value);
    }
  }, [open, value]);

  const handleOpen = React.useCallback(() => setOpen(true), []);
  const handleClose = React.useCallback(() => setOpen(false), []);

  const hasBinding = value && value.type !== 'const';

  const committedInput = React.useRef<BindableAttrValue<V> | null>(null);
  const handleCommit = React.useCallback(() => {
    let newValue = input;

    if (input?.type === 'jsExpression') {
      newValue = {
        ...input,
        value: tryFormatExpression(input.value),
      };
    }

    committedInput.current = newValue;
    onChange(newValue);
    handleClose();
  }, [onChange, input, handleClose]);

  const bindingButton = (
    <IconButton
      aria-label="Bind property"
      disabled={disabled}
      size="small"
      onClick={handleOpen}
      color={hasBinding ? 'primary' : 'inherit'}
    >
      {hasBinding ? <LinkIcon fontSize="inherit" /> : <LinkOffIcon fontSize="inherit" />}
    </IconButton>
  );

  return (
    <React.Fragment>
      {disabled ? (
        bindingButton
      ) : (
        <Tooltip title="Bind property dynamically">{bindingButton}</Tooltip>
      )}
      <Dialog onClose={handleClose} open={open} fullWidth scroll="body" maxWidth="lg">
        <DialogTitle>Bind a property</DialogTitle>
        <DialogContent>
          <Stack direction="row" sx={{ height: 400 }}>
            <Box sx={{ width: 200, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography sx={{ mb: 1 }} variant="subtitle2">
                Scope
              </Typography>
              <Box sx={{ flex: 1, width: '100%', overflow: 'auto' }}>
                <JsonView src={globalScope} />
              </Box>
            </Box>

            <Box sx={{ height: '100%', display: 'flex', flex: 1, flexDirection: 'column' }}>
              <Typography sx={{ mb: 2 }}>
                Make this property dynamic with a JavaScript expression. This property expects a
                type: <code>{propType.type}</code>.
              </Typography>

              <JsExpressionBindingEditor<V>
                globalScope={globalScope}
                onCommit={handleCommit}
                value={input}
                onChange={(newValue) => setInput(newValue)}
              />

              {server ? (
                <JsExpressionPreviewServer input={input} globalScope={globalScope} />
              ) : (
                <JsExpressionPreview input={input} globalScope={globalScope} />
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="text" onClick={handleClose}>
            Cancel
          </Button>
          <Button color="inherit" disabled={!value} onClick={() => onChange(null)}>
            Remove binding
          </Button>
          <Button
            disabled={!input || input === committedInput.current}
            color="primary"
            onClick={handleCommit}
          >
            Update binding
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
