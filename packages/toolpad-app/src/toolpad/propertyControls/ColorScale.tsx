import * as React from 'react';
import { ColorScale } from '@mui/toolpad-components';
import { Popover, Button, List, ListItem, ListItemButton } from '@mui/material';
import { Box } from '@mui/system';
import { EditorProps } from '../../types';
import PropertyControl from '../../components/PropertyControl';
import ColorPicker from '../../components/ColorPicker';

interface ColorScaleEditorProps {
  value?: ColorScale;
  onChange: (value?: ColorScale) => void;
}

function ColorScaleEditor({ value, onChange }: ColorScaleEditorProps) {
  const handleAddStop = React.useCallback(() => {}, []);

  return (
    <Box>
      <List>
        <ListItem>
          {value?.base}
          <ColorPicker
            value={value?.base}
            onChange={(newValue) => onChange({ stops: [], ...value, base: newValue })}
          />
        </ListItem>
        {value?.stops.map((stop, index) => {
          return (
            <ListItem key={index}>
              {stop.value} <ColorPicker />
            </ListItem>
          );
        })}
        <ListItem onClick={handleAddStop}>
          <ListItemButton>Add</ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}

export type ColorScaleProps = EditorProps<ColorScale>;

export default function ColorScaleControl({ label, propType, value, onChange }: ColorScaleProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handlePopoverClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const popoverIdValue = React.useId();
  const popoverId = open ? popoverIdValue : undefined;

  return (
    <React.Fragment>
      <PropertyControl propType={propType}>
        <Button aria-describedby={popoverId} onClick={handlePopoverClick}>
          {label}
        </Button>
      </PropertyControl>
      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
      >
        <Box sx={{ minWidth: 300, p: 2 }}>
          <ColorScaleEditor value={value} onChange={onChange} />
        </Box>
      </Popover>
    </React.Fragment>
  );
}
