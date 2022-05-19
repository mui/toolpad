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
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListSubheader,
  ListItemText,
  FormHelperText,
} from '@mui/material';
import * as React from 'react';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import type { EditorProps } from '../../types';

function SelectOptionsPropEditor({ label, value = [], onChange }: EditorProps<string[]>) {
  const [editOptionsDialogOpen, setEditOptionsDialogOpen] = React.useState(false);
  const [optionsText, setOptionsText] = React.useState<string | null>('');

  const handleOptionsAdd = React.useCallback(() => {
    const newOptions = optionsText?.split(',');
    if (newOptions?.length) {
      if (value?.length) {
        onChange([...value, ...newOptions]);
      } else {
        onChange([...newOptions]);
      }
    }
  }, [onChange, value, optionsText]);

  const handleOptionDelete = React.useCallback(
    (deletedIndex: number) => (event: React.MouseEvent) => {
      event.stopPropagation();
      onChange(value.filter((column, i) => i !== deletedIndex));
    },
    [onChange, value],
  );

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
        {
          <React.Fragment>
            <DialogTitle>Edit options</DialogTitle>
            <DialogContent>
              {value?.length ? (
                <List
                  dense
                  subheader={
                    <ListSubheader component="div" id="options-list">
                      Options
                    </ListSubheader>
                  }
                >
                  {value.map((option, i) => {
                    return (
                      <ListItem
                        key={i}
                        disableGutters
                        secondaryAction={
                          <IconButton
                            aria-label="Remove option"
                            edge="end"
                            onClick={handleOptionDelete(i)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemButton>
                          <ListItemText primary={option} />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              ) : null}
              <FormControl fullWidth sx={{ m: 1 }} size="small" variant="outlined">
                <InputLabel htmlFor="add-options">
                  Add {value?.length ? 'More' : 'Options'}
                </InputLabel>
                <OutlinedInput
                  id="add-options"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setOptionsText(event.target.value);
                  }}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleOptionsAdd}
                        edge="end"
                      >
                        {<CheckIcon />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Options"
                />
                <FormHelperText id="add-options-helperText">
                  Enter a comma ( , ) separated list
                </FormHelperText>
              </FormControl>
            </DialogContent>
          </React.Fragment>
        }
        <DialogActions>
          <Button color="inherit" variant="text" onClick={() => setEditOptionsDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default SelectOptionsPropEditor;
