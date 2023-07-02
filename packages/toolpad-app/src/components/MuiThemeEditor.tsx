import * as React from 'react';
import {
  PaletteColor,
  PaletteMode,
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
  return <ColorTool label={label} value={value} onChange={onChange} />;
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
