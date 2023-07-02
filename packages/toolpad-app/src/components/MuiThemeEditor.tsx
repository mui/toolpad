import * as React from 'react';
import {
  Box,
  Button,
  PaletteColor,
  PaletteMode,
  Popover,
  Stack,
  styled,
  ThemeOptions,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { WithControlledProp } from '../utils/types';
import ColorTool from './ColorTool';
import FlexFill from './FlexFill';

const IconToggleButton = styled(ToggleButton)({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  '& > *': {
    marginRight: '8px',
  },
});

interface PaletteColorPickerProps extends WithControlledProp<string> {
  label: string;
}

function PaletteColorPicker({ label, value, onChange }: PaletteColorPickerProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = React.useId();
  return (
    <React.Fragment>
      <Button aria-describedby={id} variant="outlined" onClick={handleClick}>
        {label}
        <FlexFill />
        <Box
          sx={{
            ml: 2,
            p: '2px 8px',
            background: value,
            color: theme.palette.getContrastText(value),
            borderRadius: 1,
          }}
        >
          {value}
        </Box>
      </Button>
      <Popover
        id={open ? id : undefined}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <ColorTool sx={{ m: 2 }} label={label} value={value} onChange={onChange} />
      </Popover>
    </React.Fragment>
  );
}

export interface MuiThemeEditorProps {
  value: ThemeOptions | null;
  onChange: (value: ThemeOptions) => void;
}

export default function MuiThemeEditor({ value, onChange }: MuiThemeEditorProps) {
  const theme = useTheme();
  return (
    <Stack direction="column" spacing={2}>
      <ToggleButtonGroup
        exclusive
        value={value?.palette?.mode}
        onChange={(event, newMode: PaletteMode) => {
          onChange({
            ...value,
            palette: {
              ...value?.palette,
              mode: newMode,
            },
          });
        }}
        aria-label="Mode"
      >
        <IconToggleButton value="light" aria-label="light">
          <LightModeIcon />
          Light
        </IconToggleButton>
        <IconToggleButton value="dark" aria-label="dark">
          <DarkModeIcon />
          Dark
        </IconToggleButton>
      </ToggleButtonGroup>

      <PaletteColorPicker
        label="Primary"
        value={(value?.palette?.primary as PaletteColor)?.main || '#2196f3'}
        onChange={(newMain) => {
          onChange({
            ...value,
            palette: {
              ...value?.palette,
              primary: {
                main: newMain,
                contrastText: theme.palette.getContrastText(newMain),
              },
            },
          });
        }}
      />

      <PaletteColorPicker
        label="Secondary"
        value={(value?.palette?.secondary as PaletteColor)?.main || '#f50057'}
        onChange={(newMain) => {
          onChange({
            ...value,
            palette: {
              ...value?.palette,
              secondary: {
                main: newMain,
                contrastText: theme.palette.getContrastText(newMain),
              },
            },
          });
        }}
      />
    </Stack>
  );
}
