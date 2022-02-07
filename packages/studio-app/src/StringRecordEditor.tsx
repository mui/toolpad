import { Box, TextField, IconButton } from '@mui/material';
import * as React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { omit } from './utils/immutability';
import { WithControlledProp } from './utils/types';
import { hasOwnProperty } from './utils/collections';

export interface StringRecordEditorProps extends WithControlledProp<Record<string, string>> {
  label?: string;
  fieldLabel?: string;
  valueLabel?: string;
}

export default function StringRecordEditor({
  value,
  onChange,
  label,
  fieldLabel = 'field',
  valueLabel = 'value',
}: StringRecordEditorProps) {
  const [newFieldName, setNewFieldName] = React.useState('');
  const [newFieldValue, setNewFieldValue] = React.useState('');

  const handleFieldValueChange = React.useCallback(
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...value, [field]: event.target.value });
    },
    [onChange, value],
  );

  const handleRemove = React.useCallback(
    (field: string) => () => {
      onChange(omit(value, field));
    },
    [onChange, value],
  );

  const handleNewField = React.useCallback(() => {
    onChange({ ...value, [newFieldName]: newFieldValue });
    setNewFieldName('');
    setNewFieldValue('');
  }, [newFieldName, newFieldValue, onChange, value]);

  return (
    <Box display="grid" gridTemplateColumns="1fr 2fr auto" alignItems="center" gap={1}>
      {label ? <Box gridColumn="span 3">{label}:</Box> : null}
      {Object.entries(value).map(([field, fieldValue]) => (
        <React.Fragment key={field}>
          <Box ml={2} justifySelf="end">
            {field}:
          </Box>
          <TextField
            label={valueLabel}
            size="small"
            value={fieldValue}
            onChange={handleFieldValueChange(field)}
          />
          <IconButton onClick={handleRemove(field)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </React.Fragment>
      ))}

      <TextField
        size="small"
        label={fieldLabel}
        value={newFieldName}
        onChange={(event) => setNewFieldName(event.target.value)}
      />
      <TextField
        size="small"
        label={valueLabel}
        value={newFieldValue}
        onChange={(event) => setNewFieldValue(event.target.value)}
      />
      <IconButton
        size="small"
        disabled={!newFieldName || hasOwnProperty(value, newFieldName)}
        onClick={handleNewField}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
