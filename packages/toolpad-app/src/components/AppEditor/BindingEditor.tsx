import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import * as React from 'react';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { LiveBinding, PropValueType } from '@mui/toolpad-core';
import { BindableAttrValue } from '../../types';
import { WithControlledProp } from '../../utils/types';
import { JsExpressionEditor } from './PageEditor/JsExpressionEditor';
import RuntimeErrorAlert from './PageEditor/RuntimeErrorAlert';
import JsonView from '../JsonView';
import { tryFormatExpression } from '../../utils/prettier';

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

export interface BindingEditorProps<V> extends WithControlledProp<BindableAttrValue<V> | null> {
  globalScope: Record<string, unknown>;
  liveBinding?: LiveBinding;
  disabled?: boolean;
  propType: PropValueType;
}

export function BindingEditor<V>({
  globalScope,
  liveBinding,
  disabled,
  propType,
  value,
  onChange,
}: BindingEditorProps<V>) {
  const [input, setInput] = React.useState(value);
  React.useEffect(() => setInput(value), [value]);

  const [open, setOpen] = React.useState(false);
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
  }, [onChange, input]);

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
          <Stack direction="row" sx={{ my: 2 }}>
            <Box sx={{ width: 200 }}>
              <Typography variant="subtitle2">Available variables</Typography>
              <Box sx={{ overflow: 'auto' }}>
                {Object.entries(globalScope).map(([key, scopeValue]) => (
                  <pre key={key}>
                    {key} ({typeof scopeValue})
                  </pre>
                ))}
              </Box>
            </Box>

            <Box sx={{ flex: 1 }}>
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
              {/* eslint-disable-next-line no-nested-ternary */}
              {liveBinding ? (
                liveBinding.error ? (
                  <RuntimeErrorAlert error={liveBinding.error} />
                ) : (
                  <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                    <Typography sx={{ mt: 1 }}>Actual value:</Typography>
                    <JsonView src={liveBinding.value} />
                  </Box>
                )
              ) : null}
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
