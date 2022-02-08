import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { GridColumns, GridColDef, GridAlignment } from '@mui/x-data-grid-pro';
import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { EditorProps, PropControlDefinition } from '../../types';
// TODO: this import suggests leaky abstraction
import { usePageEditorState } from '../StudioEditor/PageFileEditor/PageEditorProvider';
import { generateUniqueString } from '../../utils/strings';

const COLUMN_TYPES: string[] = ['string', 'number', 'date', 'dateTime', 'boolean'];
const ALIGNMENTS: GridAlignment[] = ['left', 'right', 'center'];

function GridColumnsPropEditor({
  propName,
  nodeId,
  value = [],
  onChange,
  disabled,
}: EditorProps<GridColumns>) {
  const state = usePageEditorState();
  const [editColumnsDialogOpen, setEditColumnsDialogOpen] = React.useState(false);
  const [editedIndex, setEditedIndex] = React.useState<number | null>(null);

  const props = state.viewState?.[nodeId]?.props ?? {};

  const editedColumn = typeof editedIndex === 'number' ? value[editedIndex] : null;

  console.log(props);

  const handleCreateColumn = React.useCallback(() => {
    const existingFields = new Set(value.map(({ field }) => field));
    const newFieldName = generateUniqueString('new', existingFields);
    onChange([...value, { field: newFieldName }]);
  }, [value, onChange]);

  const handleColumnItemClick = React.useCallback(
    (index: number) => () => {
      setEditedIndex(index);
    },
    [],
  );

  const handleColumnChange = React.useCallback(
    (newValue: GridColDef) => {
      onChange(value.map((column, i) => (i === editedIndex ? newValue : column)));
    },
    [editedIndex, onChange, value],
  );

  return (
    <React.Fragment>
      <Button onClick={() => setEditColumnsDialogOpen(true)}>{propName}</Button>
      <Dialog
        fullWidth
        open={editColumnsDialogOpen}
        onClose={() => setEditColumnsDialogOpen(false)}
      >
        {editedColumn ? (
          <React.Fragment>
            <DialogTitle>
              <IconButton onClick={() => setEditedIndex(null)}>
                <ArrowBackIcon />
              </IconButton>
              Edit column {editedColumn.field}
            </DialogTitle>
            <DialogContent>
              <Stack gap={1} py={1}>
                <TextField
                  label="field"
                  size="small"
                  value={editedColumn.field}
                  disabled={disabled}
                  onChange={(event) =>
                    handleColumnChange({ ...editedColumn, field: event.target.value })
                  }
                />
                <FormControl fullWidth size="small">
                  <InputLabel id={`select-type`}>type</InputLabel>
                  <Select
                    labelId={`select-type`}
                    size="small"
                    label="type"
                    value={editedColumn.type ?? ''}
                    disabled={disabled}
                    onChange={(event) =>
                      handleColumnChange({ ...editedColumn, type: event.target.value })
                    }
                  >
                    {COLUMN_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel id={`select-align`}>align</InputLabel>
                  <Select
                    labelId={`select-align`}
                    size="small"
                    label="align"
                    value={editedColumn.align ?? ''}
                    disabled={disabled}
                    onChange={(event) =>
                      handleColumnChange({
                        ...editedColumn,
                        align: (event.target.value as GridAlignment) || undefined,
                      })
                    }
                  >
                    {ALIGNMENTS.map((alignment) => (
                      <MenuItem key={alignment} value={alignment}>
                        {alignment}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </DialogContent>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <DialogTitle>Edit columns</DialogTitle>
            <DialogContent>
              <List dense>
                {value.map((colDef, i) => {
                  return (
                    <ListItem key={colDef.field} disableGutters onClick={handleColumnItemClick(i)}>
                      <ListItemButton>
                        <ListItemText primary={colDef.field} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
              <IconButton onClick={handleCreateColumn} disabled={disabled}>
                <AddIcon />
              </IconButton>
            </DialogContent>
          </React.Fragment>
        )}
      </Dialog>
    </React.Fragment>
  );
}

const jsonType: PropControlDefinition<GridColumns> = {
  Editor: GridColumnsPropEditor,
};

export default jsonType;
