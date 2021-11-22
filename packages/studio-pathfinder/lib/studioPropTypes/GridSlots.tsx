import * as React from 'react';
import {
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { EditorProps, GridSlot, PropTypeDefinition } from '../types';

function GridSlotsPropEditor({ name, value, onChange, disabled }: EditorProps<GridSlot[]>) {
  const handleAddClick = React.useCallback(() => {
    onChange([...value, { span: 1, content: null }]);
  }, [onChange, value]);

  const handleDeleteClick = (index: number) => () => {
    onChange(value.filter((item, i) => i !== index));
  };

  const handleChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(
      value.map((item, i) => (i === index ? { ...item, span: Number(event.target.value) } : item)),
    );
  };

  return (
    <div>
      <Typography>{name}:</Typography>
      <List dense>
        {value.map((slot, i) => {
          return (
            <ListItem
              disableGutters
              key={i}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={handleDeleteClick(i)}
                  disabled={disabled}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <TextField
                size="small"
                fullWidth
                type="number"
                value={slot.span}
                onChange={handleChange(i)}
                disabled={disabled}
               />
            </ListItem>
          );
        })}
        <ListItemButton onClick={handleAddClick} disabled={disabled}>
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary="Add Sot" />
        </ListItemButton>
      </List>
    </div>
  );
}

const GridSlots: PropTypeDefinition<GridSlot[]> = {
  Editor: GridSlotsPropEditor,
};

export default GridSlots;
