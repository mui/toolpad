import { Box, TextField, IconButton, SxProps } from '@mui/material';
import * as React from 'react';
import CloseIcon from '@mui/icons-material/Close';
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

  const canSubmit = newFieldName && !hasOwnProperty(value, newFieldName);

  return (
    <Box sx={sx} display="grid" gridTemplateColumns="1fr 2fr auto" alignItems="center" gap={1}>
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
          disabled={!canSubmit}
          onChange={(event) => setNewFieldValue(event.target.value)}
        />
        <IconButton size="small" disabled={!canSubmit} type="submit">
          <AddIcon fontSize="small" />
        </IconButton>
      </form>
    </Box>
  );
}
