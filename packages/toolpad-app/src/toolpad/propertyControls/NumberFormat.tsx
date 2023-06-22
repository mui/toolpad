import { Box, Button, Popover } from '@mui/material';
import * as React from 'react';
import { NumberFormat, NumberFormatEditor } from '@mui/toolpad-core/numberFormat';
import type { EditorProps } from '../../types';
import PropertyControl from '../../components/PropertyControl';

function GridColumnsPropEditor({
  propType,
  label,
  value,
  onChange,
  disabled,
}: EditorProps<NumberFormat>) {
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
          <NumberFormatEditor disabled={disabled} value={value} onChange={onChange} />
        </Box>
      </Popover>
    </React.Fragment>
  );
}

export default GridColumnsPropEditor;
