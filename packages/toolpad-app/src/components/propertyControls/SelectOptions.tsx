import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  OutlinedInput,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  FormHelperText,
  Stack,
  TextField,
} from '@mui/material';
import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { EditorProps } from '../../types';

interface SelectOption {
  label?: string;
  value: string;
}

function SelectOptionsPropEditor({
  label,
  value = [],
  onChange,
}: EditorProps<(string | SelectOption)[]>) {
  const [editOptionsDialogOpen, setEditOptionsDialogOpen] = React.useState(false);
  const optionInputRef = React.useRef<HTMLInputElement | null>(null);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

  const editingOption: SelectOption | null = React.useMemo(() => {
    if (typeof editingIndex === 'number') {
      const option: SelectOption | string = value[editingIndex];
      if (typeof option === 'string') {
        return {
          value: option,
          label: '',
        };
      }
      return option;
    }
    return null;
  }, [editingIndex, value]);

  const handleOptionTextTnput = React.useCallback(
    (
      event:
        | React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
        | React.ChangeEvent<HTMLInputElement>,
    ) => {
      if ('key' in event && event.key === 'Enter') {
        onChange([...value, (event.target as HTMLInputElement).value]);

        if (optionInputRef.current) {
          optionInputRef.current.value = '';
        }
      }
    },
    [onChange, value],
  );

  const handleOptionDelete = React.useCallback(
    (deletedIndex: number) => (event: React.MouseEvent) => {
      event.stopPropagation();
      onChange(value.filter((column, i) => i !== deletedIndex));
    },
    [onChange, value],
  );

  const handleDeleteAll = React.useCallback(() => {
    onChange([]);
  }, [onChange]);

  const handleOptionItemClick = React.useCallback(
    (index: number) => () => {
      setEditingIndex(index);
    },
    [],
  );

  const handleOptionChange = React.useCallback(
    (newValue: SelectOption) => {
      onChange(value.map((option, i) => (i === editingIndex ? newValue : option)));
    },
    [editingIndex, onChange, value],
  );

  const handleEditOptionsDialogClose = React.useCallback(() => {
    setEditingIndex(null);
    setEditOptionsDialogOpen(false);
  }, []);

  return (
    <React.Fragment>
      <Button
        variant="outlined"
        color="inherit"
        fullWidth
        onClick={() => setEditOptionsDialogOpen(true)}
      >
        {label}
      </Button>
      <Dialog
        fullWidth
        open={editOptionsDialogOpen}
        onClose={() => setEditOptionsDialogOpen(false)}
      >
        {editingOption ? (
          <React.Fragment>
            <DialogTitle>
              <IconButton aria-label="Back" onClick={() => setEditingIndex(null)}>
                <ArrowBackIcon />
              </IconButton>
              Edit option &ldquo;{editingOption.value}&rdquo;
            </DialogTitle>
            <DialogContent>
              <Stack gap={1} py={1}>
                <TextField
                  label="Value"
                  size="small"
                  value={editingOption.value}
                  onChange={(event) => {
                    handleOptionChange({ ...editingOption, value: event.target.value });
                  }}
                />
                <TextField
                  label="Label"
                  size="small"
                  value={editingOption.label}
                  onChange={(event) => {
                    handleOptionChange({ ...editingOption, label: event.target.value });
                  }}
                />
              </Stack>
            </DialogContent>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <DialogTitle>
              Edit options
              {value.length > 0 ? (
                <Button
                  aria-label="Delete all options"
                  variant="text"
                  size="small"
                  color="inherit"
                  onClick={handleDeleteAll}
                  sx={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                  }}
                >
                  Delete All
                </Button>
              ) : null}
            </DialogTitle>
            <DialogContent>
              {value.length > 0 ? (
                <List dense>
                  {value.map((option, i) => {
                    return (
                      <ListItem
                        key={i}
                        disableGutters
                        onClick={handleOptionItemClick(i)}
                        secondaryAction={
                          <IconButton
                            aria-label="Delete option"
                            edge="end"
                            onClick={handleOptionDelete(i)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemButton>
                          <ListItemText
                            primary={
                              typeof option === 'string' ? option : (option as SelectOption).value
                            }
                            secondary={
                              typeof option === 'object'
                                ? `Label: "${(option as SelectOption).label}"`
                                : null
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              ) : null}
              <FormControl fullWidth sx={{ m: 1 }} size="small" variant="outlined">
                <InputLabel htmlFor="add-options">Add option</InputLabel>
                <OutlinedInput
                  inputRef={optionInputRef}
                  id="add-options"
                  onKeyUp={handleOptionTextTnput}
                  label="Add option"
                />
                <FormHelperText id="add-options-helperText">
                  Press &ldquo;Enter&rdquo; / &ldquo;Return&rdquo; to add
                </FormHelperText>
              </FormControl>
            </DialogContent>
          </React.Fragment>
        )}
        <DialogActions>
          <Button color="inherit" variant="text" onClick={handleEditOptionsDialogClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default SelectOptionsPropEditor;
