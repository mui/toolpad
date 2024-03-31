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
import JSON5 from 'json5';
import type { EditorProps } from '../../types';
import useShortcut from '../../utils/useShortcut';
import lazyComponent from '../../utils/lazyComponent';
import PropertyControl from '../../components/PropertyControl';

const JsonEditor = lazyComponent(() => import('../../components/JsonEditor'), {
  noSsr: true,
  fallback: <Skeleton variant="rectangular" height="100%" />,
});

function JsonPropEditor({ label, propType, value, onChange, disabled }: EditorProps<any>) {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const valueAsString = React.useMemo(() => JSON.stringify(value, null, 2), [value]);
  const [input, setInput] = React.useState(valueAsString);
  React.useEffect(() => setInput(valueAsString), [valueAsString]);

  const normalizedInitial = React.useMemo(() => JSON.stringify(value), [value]);
  const normalizedInput = React.useMemo(() => {
    if (!input) {
      return '';
    }
    try {
      return JSON.stringify(JSON5.parse(input));
    } catch {
      return null;
    }
  }, [input]);

  const handleSave = React.useCallback(() => {
    const newValue = input === '' ? undefined : JSON5.parse(input);
    onChange(newValue);
  }, [onChange, input]);

  const [schemaUri, setSchemaUri] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (propType.type !== 'object' && propType.type !== 'array') {
      return () => {};
    }

    if (!propType.schema) {
      return () => {};
    }

    const blob = new Blob([JSON.stringify(propType.schema, null, 2)], {
      type: 'application/json',
    });

    const uri = URL.createObjectURL(blob);

    setSchemaUri(uri);

    return () => {
      URL.revokeObjectURL(uri);
    };
  }, [propType]);

  useShortcut({ key: 's', metaKey: true, disabled: !dialogOpen }, handleSave);

  return (
    <React.Fragment>
      <PropertyControl propType={propType}>
        <Button
          variant="outlined"
          color="inherit"
          sx={{ my: 0.5 }}
          fullWidth
          onClick={() => setDialogOpen(true)}
        >
          {label}
        </Button>
      </PropertyControl>
      <Dialog fullWidth open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Edit JSON</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 200 }}>
            <JsonEditor
              value={input}
              onChange={(newValue = '') => setInput(newValue)}
              schemaUri={schemaUri}
              disabled={disabled}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="text" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={normalizedInput === null || normalizedInitial === normalizedInput}
            onClick={handleSave}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default JsonPropEditor;
