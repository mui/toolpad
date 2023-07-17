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
  Tab,
  TextField,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import { TabContext, TabList, TabPanel as MuiTabPanel } from '@mui/lab';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { ColumnType, DataGridFile } from '../shared/schemas';
import { useServer } from './server';

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

const TabPanel = styled(MuiTabPanel)({ padding: 0, flex: 1, minHeight: 0 });

type DataGridColumnsSpec = NonNullable<NonNullable<DataGridFile['spec']>['columns']>;

interface ColumnsEditorProps {
  value: DataGridColumnsSpec;
  onChange: (value: DataGridColumnsSpec) => void;
}

function ColumnsEditor({ value, onChange }: ColumnsEditorProps) {
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

interface DataGridFileEditorProps {
  name: string;
  value: DataGridFile;
  onChange: (value: DataGridFile) => void;
}

export default function DataGridFileEditor({ name, value, onChange }: DataGridFileEditorProps) {
  const [activeTab, setActiveTab] = React.useState('columns');

  const server = useServer();

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TabContext value={activeTab}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'end',
          }}
        >
          <TabList onChange={(_event, newValue) => setActiveTab(newValue)}>
            <Tab label="data" value="data" />
            <Tab label="Columns" value="columns" />
            <Tab label="Source code" value="source" />
          </TabList>
          <Tooltip title="Commit changes">
            <IconButton
              sx={{ m: 0.5 }}
              onClick={() => {
                server.saveFile(name, value);
              }}
            >
              <SaveIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <TabPanel value="data">Data panel</TabPanel>
        <TabPanel value="columns">
          <ColumnsEditor
            value={value.spec?.columns ?? []}
            onChange={(newColumns) =>
              onChange({
                ...value,
                spec: {
                  ...value.spec,
                  columns: newColumns,
                },
              })
            }
          />
        </TabPanel>
        <TabPanel value="source">Source</TabPanel>
      </TabContext>
    </Box>
  );
}
