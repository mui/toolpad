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
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { ColumnType, ColumnDefinitionsSpec, DataGridSpec } from '../../shared/schemas';

interface ColumnTypeOption {
  value: ColumnType;
  label: string;
}

const COLUMN_TYPE_OPTIONS: ColumnTypeOption[] = [
  {
    value: 'string',
    label: 'String',
  },
  {
    value: 'number',
    label: 'Number',
  },
  {
    value: 'boolean',
    label: 'Boolean',
  },
  {
    value: 'date',
    label: 'Date',
  },
  {
    value: 'datetime',
    label: 'DateTime',
  },
];

export interface ColumnsDefinitionsEditorProps {
  value: ColumnDefinitionsSpec;
  onChange: (value: ColumnDefinitionsSpec) => void;
}

export function ColumnsDefinitionsEditor({ value, onChange }: ColumnsDefinitionsEditorProps) {
  const [activeField, setActiveField] = React.useState(value[0]?.field);

  const activeColumn = React.useMemo(
    () => value.find((column) => column.field === activeField),
    [activeField, value],
  );

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
          <IconButton onClick={() => onChange([...value, { field: 'new' }])}>
            <AddIcon />
          </IconButton>
        </Box>
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {value.map((column) => {
              return (
                <ListItem key={column.field} disablePadding>
                  <ListItemButton
                    selected={activeField === column.field}
                    onClick={() => setActiveField(column.field)}
                  >
                    <ListItemText secondary={column.type}>{column.field}</ListItemText>{' '}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Stack>
      <Box sx={{ p: 2 }}>
        {activeColumn ? (
          <React.Fragment>
            <Typography>Field: {activeColumn.field}</Typography>
            <TextField
              select
              value={activeColumn.type ?? 'string'}
              onChange={(event) =>
                onChange(
                  value.map((column) =>
                    column.field === activeField
                      ? { ...column, type: event.target.value as ColumnType }
                      : column,
                  ),
                )
              }
            >
              {COLUMN_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </React.Fragment>
        ) : null}
      </Box>
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
      <TextField
        label="Id selector"
        value={value.idSelector}
        onChange={(event) => onChange({ ...value, idSelector: event.target.value })}
      />
      <ColumnsDefinitionsEditor
        value={value.columns || []}
        onChange={(columns) => onChange({ ...value, columns })}
      />
    </Box>
  );
}
