import { Box, TextField, IconButton, SxProps } from '@mui/material';
import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { omit } from '../utils/immutability';
import { WithControlledProp } from '../utils/types';
import { hasOwnProperty } from '../utils/collections';

export interface StringRecordEditorProps extends WithControlledProp<Record<string, string>> {
  label?: string;
  fieldLabel?: string;
  valueLabel?: string;
  autoFocus?: boolean;
  sx?: SxProps;
}

export default function StringRecordEditor({
  value,
  onChange,
  label,
  fieldLabel = 'field',
  valueLabel = 'value',
  autoFocus = false,
  sx,
}: StringRecordEditorProps) {
  const [newFieldName, setNewFieldName] = React.useState('');
  const [newFieldValue, setNewFieldValue] = React.useState('');
  const fieldInputRef = React.useRef<HTMLInputElement>(null);

  const [editedField, setEditedField] = React.useState<null | string>(null);
  const [editedFieldName, setEditedFieldName] = React.useState<string>('');

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

  const handleSave = React.useCallback(() => {
    if (!editedField || !editedFieldName) {
      return;
    }
    const oldValue = value[editedField];
    setEditedField(null);
    onChange({ ...omit(value, editedField), [editedFieldName]: oldValue });
  }, [onChange, value, editedField, editedFieldName]);

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onChange({ ...value, [newFieldName]: newFieldValue });
      setNewFieldName('');
      setNewFieldValue('');
      fieldInputRef.current?.focus();
    },
    [newFieldName, newFieldValue, onChange, value],
  );

  const canSubmit = !editedField && newFieldName && !hasOwnProperty(value, newFieldName);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      console.log(event.key);
      if (event.key === 'Enter') {
        handleSave();
        event.preventDefault();
      }
      if (event.key === 'Escape') {
        setEditedField(null);
        event.preventDefault();
      }
    },
    [handleSave],
  );

  return (
    <Box sx={sx} display="grid" gridTemplateColumns="1fr 2fr auto" alignItems="center" gap={1}>
      {label ? <Box gridColumn="span 3">{label}:</Box> : null}
      {Object.entries(value).map(([field, fieldValue]) => (
        <React.Fragment key={field}>
          {editedField === field ? (
            <TextField
              label={valueLabel}
              size="small"
              value={editedFieldName}
              autoFocus
              onChange={(event) => setEditedFieldName(event.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <Box
              ml={2}
              justifySelf="end"
              onClick={() => {
                setEditedField(field);
                setEditedFieldName(field);
              }}
            >
              {field}:
            </Box>
          )}
          <TextField
            label={valueLabel}
            size="small"
            value={fieldValue}
            onChange={handleFieldValueChange(field)}
          />

          <IconButton onClick={handleRemove(field)} size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </React.Fragment>
      ))}

      <form style={{ display: 'contents' }} onSubmit={handleSubmit}>
        <TextField
          inputRef={fieldInputRef}
          size="small"
          label={fieldLabel}
          value={newFieldName}
          onChange={(event) => setNewFieldName(event.target.value)}
          autoFocus={autoFocus}
        />
        <TextField
          size="small"
          label={valueLabel}
          value={newFieldValue}
          onChange={(event) => setNewFieldValue(event.target.value)}
        />
        <IconButton size="small" disabled={!canSubmit} type="submit">
          <AddIcon fontSize="small" />
        </IconButton>
      </form>
    </Box>
  );
}
