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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import {
  ColumnType,
  ColumnDefinitionsSpec,
  DataGridSpec,
  ColumnDefinitionSpec,
} from '../../shared/schemas';

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

interface ColumnDefinitionEditorProps {
  value: ColumnDefinitionSpec;
  onChange: (value: ColumnDefinitionSpec) => void;
}

function ColumnDefinitionEditor({ value, onChange }: ColumnDefinitionEditorProps) {
  return (
    <React.Fragment>
      <TextField
        label="Field"
        value={value.field}
        onChange={(event) => onChange({ ...value, field: event.target.value })}
      />
      <TextField
        select
        value={value.type ?? 'string'}
        onChange={(event) => onChange({ ...value, type: event.target.value as ColumnType })}
      >
        {COLUMN_TYPE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
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
          <IconButton onClick={() => onChange([...value, { field: 'new' }])}>
            <AddIcon />
          </IconButton>
        </Box>
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {value.map((column, i) => {
              return (
                <ListItem key={column.field} disablePadding>
                  <ListItemButton selected={activeIndex === i} onClick={() => setActiveIndex(i)}>
                    <ListItemText secondary={column.type}>{column.field}</ListItemText>{' '}
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
            value={activeColumn}
            onChange={(newColumn) => {
              onChange(value.map((column, i) => (i === activeIndex ? newColumn : column)));
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
