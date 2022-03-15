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
  Menu,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { GridColumns, GridColDef, GridAlignment } from '@mui/x-data-grid-pro';
import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { inferColumns } from '@mui/studio-components';
import type { EditorProps, PropControlDefinition } from '../../types';

// TODO: this import suggests leaky abstraction
import { usePageEditorState } from '../StudioEditor/PageEditor/PageEditorProvider';
import { generateUniqueString } from '../../utils/strings';

const COLUMN_TYPES: string[] = ['string', 'number', 'date', 'dateTime', 'boolean'];
const ALIGNMENTS: GridAlignment[] = ['left', 'right', 'center'];

function GridColumnsPropEditor({
  label,
  nodeId,
  value = [],
  onChange,
  disabled,
}: EditorProps<GridColumns>) {
  const { viewState } = usePageEditorState();
  const [editColumnsDialogOpen, setEditColumnsDialogOpen] = React.useState(false);
  const [editedIndex, setEditedIndex] = React.useState<number | null>(null);

  const editedColumn = typeof editedIndex === 'number' ? value[editedIndex] : null;
  React.useEffect(() => {
    if (editColumnsDialogOpen) {
      setEditedIndex(null);
    }
  }, [editColumnsDialogOpen]);

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setMenuAnchorEl(null);
  };

  const definedRows = viewState.nodes[nodeId]?.props.rows;

  const columnSuggestions = React.useMemo(() => {
    const inferred = inferColumns(Array.isArray(definedRows) ? definedRows : []);
    const existingFields = new Set(value.map(({ field }) => field));
    return inferred.filter((column) => !existingFields.has(column.field));
  }, [definedRows, value]);

  const handleCreateColumn = React.useCallback(
    (suggestion: GridColDef) => () => {
      const existingFields = new Set(value.map(({ field }) => field));
      const newFieldName = generateUniqueString(suggestion.field, existingFields);
      const newValue = [...value, { ...suggestion, field: newFieldName }];
      onChange(newValue);
      setEditedIndex(newValue.length - 1);
      handleClose();
    },
    [value, onChange],
  );

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

  const handleColumnDelete = React.useCallback(
    (deletedIndex: number) => (event: React.MouseEvent) => {
      event.stopPropagation();
      onChange(value.filter((column, i) => i !== deletedIndex));
    },
    [onChange, value],
  );

  return (
    <React.Fragment>
      <Button onClick={() => setEditColumnsDialogOpen(true)}>{label}</Button>
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
                <TextField
                  label="width"
                  size="small"
                  type="number"
                  value={editedColumn.width}
                  disabled={disabled}
                  onChange={(event) =>
                    handleColumnChange({ ...editedColumn, width: Number(event.target.value) })
                  }
                />
              </Stack>
            </DialogContent>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <DialogTitle>Edit columns</DialogTitle>
            <DialogContent>
              <IconButton onClick={handleMenuClick} disabled={disabled}>
                <AddIcon />
              </IconButton>
              <Menu
                id="new-column-menu"
                anchorEl={menuAnchorEl}
                open={menuOpen}
                onClose={handleClose}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
              >
                {columnSuggestions.map((suggestion) => (
                  <MenuItem key={suggestion.field} onClick={handleCreateColumn(suggestion)}>
                    {suggestion.field}
                  </MenuItem>
                ))}
                <MenuItem onClick={handleCreateColumn({ field: 'new' })}>new column</MenuItem>
              </Menu>
              <List dense>
                {value.map((colDef, i) => {
                  return (
                    <ListItem
                      key={colDef.field}
                      disableGutters
                      onClick={handleColumnItemClick(i)}
                      secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={handleColumnDelete(i)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemButton>
                        <ListItemText primary={colDef.field} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
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
