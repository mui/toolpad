import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
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
  const [optionTextInputInvalid, setOptionTextInputInvalid] = React.useState(false);

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

  const handleOptionTextInput = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter') {
        const inputText = (event.target as HTMLInputElement).value;
        if (!inputText) {
          setOptionTextInputInvalid(true);
          return;
        }

        onChange([...value, (event.target as HTMLInputElement).value]);
        if (optionInputRef.current) {
          optionInputRef.current.value = '';
        }
      } else {
        setOptionTextInputInvalid(false);
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
      setOptionTextInputInvalid(false);
      setEditingIndex(index);
    },
    [],
  );

  const handleOptionChange = React.useCallback(
    (newValue: SelectOption) => {
      let newOption: string | SelectOption = newValue;
      setOptionTextInputInvalid(Boolean(!newValue.value));
      if (!newValue.label) {
        newOption = newValue.value;
      }
      onChange(value.map((option, i) => (i === editingIndex ? newOption : option)));
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
        onClick={() => {
          setEditOptionsDialogOpen(true);
        }}
      >
        {label}
      </Button>
      <Dialog
        fullWidth
        open={editOptionsDialogOpen}
        onClose={() => {
          if (optionTextInputInvalid) {
            return;
          }
          setEditOptionsDialogOpen(false);
        }}
      >
        {editingOption ? (
          <React.Fragment>
            <DialogTitle>
              <IconButton
                aria-label="Back"
                onClick={() => setEditingIndex(null)}
                disabled={optionTextInputInvalid}
              >
                <ArrowBackIcon />
              </IconButton>
              Edit option &ldquo;{editingOption.value}&rdquo;
            </DialogTitle>
            <DialogContent>
              <Stack gap={1} py={1}>
                <TextField
                  label="Value"
                  value={editingOption.value}
                  onChange={(event) => {
                    handleOptionChange({ ...editingOption, value: event.target.value });
                  }}
                  error={optionTextInputInvalid}
                  helperText={optionTextInputInvalid ? 'Option cannot be empty' : null}
                />
                <TextField
                  label="Label"
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
                <List>
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
                            <DeleteIcon />
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
              <TextField
                fullWidth
                sx={{ my: 1 }}
                variant="outlined"
                inputRef={optionInputRef}
                onKeyUp={handleOptionTextInput}
                label="Add option"
                error={optionTextInputInvalid}
                helperText={
                  optionTextInputInvalid ? (
                    'Option cannot be empty'
                  ) : (
                    <span>
                      Press <kbd>Enter</kbd> or <kbd>Return</kbd> to add
                    </span>
                  )
                }
              />
            </DialogContent>
          </React.Fragment>
        )}
        <DialogActions>
          <Button
            color="inherit"
            variant="text"
            onClick={handleEditOptionsDialogClose}
            disabled={optionTextInputInvalid}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default SelectOptionsPropEditor;
