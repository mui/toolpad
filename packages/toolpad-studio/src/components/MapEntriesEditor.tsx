import { Box, TextField, IconButton, SxProps } from '@mui/material';
import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { WithControlledProp } from '@toolpad/utils/types';

function renderStringValueEditor({
  label,
  disabled,
  value,
  onChange,
}: RenderValueEditorParams<string>) {
  return (
    <TextField
      label={label}
      disabled={disabled}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

interface RenderValueEditorParams<V> extends WithControlledProp<V> {
  label?: string;
  disabled?: boolean;
}

interface RenderValueEditor<V> {
  (params: RenderValueEditorParams<V>): React.ReactNode;
}

interface MapEntriesEditorExtraProps<V> {
  defaultValue: V;
  renderValueEditor: RenderValueEditor<V>;
}

type MapEntriesEditorTypedProps<V> = string extends V
  ? Partial<MapEntriesEditorExtraProps<V>>
  : MapEntriesEditorExtraProps<V>;

export type MapEntriesEditorProps<V> = WithControlledProp<[string, V][]> & {
  label?: string;
  fieldLabel?: string;
  valueLabel?: string;
  autoFocus?: boolean;
  sx?: SxProps;
  disabled?: boolean;
  isEntryDisabled?: (entry: [string, V], i: number) => boolean;
} & MapEntriesEditorTypedProps<V>;

export default function MapEntriesEditor<V = string>({
  value,
  onChange,
  label,
  fieldLabel = 'field',
  valueLabel = 'value',
  defaultValue: defaultValueProp,
  autoFocus = false,
  sx,
  renderValueEditor: renderValueEditorProp,
  disabled,
  isEntryDisabled,
}: MapEntriesEditorProps<V>) {
  const fieldInputRef = React.useRef<HTMLInputElement>(null);

  const handleRemove = React.useCallback(
    (index: number) => () => {
      onChange(value.filter((entry, i) => i !== index));
    },
    [onChange, value],
  );

  const isValidFieldName: boolean[] = React.useMemo(() => {
    const counts: Record<string, number> = {};
    value.forEach(([field]) => {
      counts[field] = counts[field] ? counts[field] + 1 : 1;
    });
    return value.map(([field]) => !!field && counts[field] <= 1);
  }, [value]);

  const renderValueEditor =
    renderValueEditorProp ?? (renderStringValueEditor as unknown as RenderValueEditor<V>);

  const defaultValue = defaultValueProp ?? ('' as unknown as V);

  return (
    <Box sx={sx} display="grid" gridTemplateColumns="1fr 2fr auto" alignItems="center" gap={1}>
      {label ? <Box gridColumn="span 3">{label}:</Box> : null}
      {value.map((entry, index) => {
        const [field, fieldValue] = entry;
        const entryDisabled = disabled || isEntryDisabled?.(entry, index);
        return (
          <React.Fragment key={index}>
            <TextField
              disabled={entryDisabled}
              label={fieldLabel}
              value={field}
              autoFocus
              onChange={(event) =>
                onChange(
                  value.map((existingEntry, i) =>
                    i === index ? [event.target.value, existingEntry[1]] : existingEntry,
                  ),
                )
              }
              error={!isValidFieldName[index]}
            />

            {renderValueEditor({
              label: valueLabel,
              value: fieldValue,
              onChange(newValue) {
                onChange(
                  value.map((existingEntry, i) =>
                    i === index ? [existingEntry[0], newValue] : existingEntry,
                  ),
                );
              },
              disabled: entryDisabled,
            })}

            <IconButton
              aria-label="Delete property"
              onClick={handleRemove(index)}
              disabled={entryDisabled}
            >
              <DeleteIcon />
            </IconButton>
          </React.Fragment>
        );
      })}

      <form autoComplete="off" style={{ display: 'contents' }}>
        <TextField
          inputRef={fieldInputRef}
          label={fieldLabel}
          value=""
          onChange={(event) => {
            onChange([...value, [event.target.value, defaultValue]]);
          }}
          autoFocus={autoFocus}
          disabled={disabled}
        />
      </form>
    </Box>
  );
}
