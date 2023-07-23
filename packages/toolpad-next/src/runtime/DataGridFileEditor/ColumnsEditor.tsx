import * as React from 'react';
import {
  Box,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Stack,
  Autocomplete,
  TextField,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  ColumnType,
  ColumnDefinitionsSpec,
  DataGridSpec,
  ColumnDefinitionSpec,
} from '../../shared/schemas';
import JsonPointerInput from '../JsonPointerInput';
import { useProbe } from '../probes';
import * as jsonPointer from '../../shared/jsonPointer';

interface ColumnTypeOption {
  label: string;
}

const COLUMN_TYPE_OPTIONS: Record<ColumnType, ColumnTypeOption> = {
  string: { label: 'String' },
  number: { label: 'Number' },
  boolean: { label: 'Boolean' },
  date: { label: 'Date' },
  datetime: { label: 'DateTime' },
};

function getTypeLabel(type?: ColumnType) {
  return type ? COLUMN_TYPE_OPTIONS[type].label : COLUMN_TYPE_OPTIONS.string.label;
}

interface ColumnDefinitionEditorProps {
  columns: ColumnDefinitionsSpec;
  value: ColumnDefinitionSpec;
  onChange: (value: ColumnDefinitionSpec) => void;
  onDelete: () => void;
}

function ColumnDefinitionEditor({
  columns,
  value,
  onChange,
  onDelete,
}: ColumnDefinitionEditorProps) {
  const rows = useProbe('rows');

  const fieldSuggestions = React.useMemo(() => {
    const availableKeys = Object.keys((rows as any)?.[0] ?? {});
    const definedKeys = new Set(columns.map((column) => column.field));
    return availableKeys.filter((key) => !definedKeys.has(key));
  }, [columns, rows]);

  return (
    <React.Fragment>
      <Autocomplete
        freeSolo
        disableClearable
        options={fieldSuggestions}
        value={value.field}
        onChange={(event, newValue) => onChange({ ...value, field: newValue })}
        renderInput={(params) => <TextField {...params} label="Field" />}
      />
      <JsonPointerInput
        label="Value Selector"
        target={(rows as any)?.[0]}
        value={value.valueSelector || jsonPointer.encode([value.field])}
        onChange={(valueSelector) => onChange({ ...value, valueSelector })}
        helperText={
          <React.Fragment>
            Valid <a href="https://datatracker.ietf.org/doc/html/rfc6901">JSON Pointer</a> that
            references a (nested) property in the returned row.
          </React.Fragment>
        }
      />
      <TextField
        label="Type"
        select
        value={value.type ?? 'string'}
        onChange={(event) => onChange({ ...value, type: event.target.value as ColumnType })}
      >
        {Object.keys(COLUMN_TYPE_OPTIONS).map((type) => (
          <MenuItem key={type} value={type}>
            {getTypeLabel(type as ColumnType)}
          </MenuItem>
        ))}
      </TextField>
      <Button color="error" startIcon={<DeleteIcon />} onClick={() => onDelete?.()}>
        Remove column
      </Button>
    </React.Fragment>
  );
}

export interface ColumnsDefinitionsEditorProps {
  value: ColumnDefinitionsSpec;
  onChange: (value: ColumnDefinitionsSpec) => void;
}

export function ColumnsDefinitionsEditor({ value, onChange }: ColumnsDefinitionsEditorProps) {
  const [activeIndex, setActiveIndex] = React.useState<number>(0);

  const activeColumn = React.useMemo(() => value[activeIndex], [activeIndex, value]);

  return (
    <Stack direction="row" sx={{ width: '100%', height: '100%' }}>
      <Stack direction="column" sx={{ width: '25%' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            p: 1,
            gap: 1,
          }}
        >
          <OutlinedInput
            fullWidth
            endAdornment={
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            }
          />
          <IconButton
            onClick={() => {
              onChange([...value, { field: 'new' }]);
              setActiveIndex(value.length);
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {value.map((column, i) => {
              return (
                <ListItem key={column.field} disablePadding>
                  <ListItemButton selected={activeIndex === i} onClick={() => setActiveIndex(i)}>
                    <ListItemText secondary={getTypeLabel(column.type)}>
                      {column.field}
                    </ListItemText>
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Stack>
      <Stack sx={{ p: 2 }}>
        {activeColumn ? (
          <ColumnDefinitionEditor
            columns={value}
            value={activeColumn}
            onChange={(newColumn) => {
              onChange(value.map((column, i) => (i === activeIndex ? newColumn : column)));
            }}
            onDelete={() => {
              onChange(value.filter((_, i) => i !== activeIndex));
              setActiveIndex(0);
            }}
          />
        ) : null}
      </Stack>
    </Stack>
  );
}

export interface ColumnsEditorProps {
  value: DataGridSpec;
  onChange: (value: DataGridSpec) => void;
}

export default function ColumnsEditor({ value, onChange }: ColumnsEditorProps) {
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <ColumnsDefinitionsEditor
        value={value.columns || []}
        onChange={(columns) => onChange({ ...value, columns })}
      />
    </Box>
  );
}
