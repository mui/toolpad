import * as React from 'react';
import {
  MenuItem,
  Stack,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  styled,
  TextField,
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import * as appDom from '../../../appDom';
import { WithControlledProp } from '../../../utils/types';
import { useDom, useDomApi } from '../../AppState';

const IconToggleButton = styled(ToggleButton)({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  '& > *': {
    marginRight: '8px',
  },
});

const THEME_COLORS = [
  'red',
  'pink',
  'purple',
  'deepPurple',
  'indigo',
  'blue',
  'lightBlue',
  'cyan',
  'teal',
  'green',
  'lightGreen',
  'lime',
  'yellow',
  'amber',
  'orange',
  'deepOrange',
];

interface PaletteColorPickerProps extends WithControlledProp<string> {
  name: string;
}

function PaletteColorPicker({ name, value, onChange }: PaletteColorPickerProps) {
  return (
    <TextField
      select
      fullWidth
      value={value}
      label={name}
      onChange={(event) => onChange(event.target.value)}
    >
      {THEME_COLORS.map((color) => (
        <MenuItem key={color} value={color}>
          {color}
        </MenuItem>
      ))}
    </TextField>
  );
}

export interface ComponentEditorProps {
  className?: string;
}

export default function ComponentEditor({ className }: ComponentEditorProps) {
  const { dom } = useDom();
  const domApi = useDomApi();

  const app = appDom.getApp(dom);
  const { themes = [] } = appDom.getChildNodes(dom, app);
  const theme = themes.length > 0 ? themes[0] : null;

  const handleAddThemeClick = () => {
    const newTheme = appDom.createNode(dom, 'theme', {
      name: 'Theme',
      theme: {},
      attributes: {},
    });
    domApi.update((draft) => appDom.addNode(draft, newTheme, app, 'themes'));
  };

  return (
    <div className={className} data-testid="theme-editor">
      {theme ? (
        <Stack spacing={2}>
          <ToggleButtonGroup
            exclusive
            value={appDom.fromConstPropValue(theme.theme?.['palette.mode']) || 'light'}
            onChange={(event, newValue) => {
              domApi.update((draft) =>
                appDom.setNodeNamespacedProp(draft, theme, 'theme', 'palette.mode', {
                  type: 'const',
                  value: newValue,
                }),
              );
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
            name="primary"
            value={appDom.fromConstPropValue(theme.theme?.['palette.primary.main']) || ''}
            onChange={(newValue) => {
              domApi.update((draft) =>
                appDom.setNodeNamespacedProp(draft, theme, 'theme', 'palette.primary.main', {
                  type: 'const',
                  value: newValue,
                }),
              );
            }}
          />
          <PaletteColorPicker
            name="secondary"
            value={appDom.fromConstPropValue(theme.theme?.['palette.secondary.main']) || ''}
            onChange={(newValue) => {
              domApi.update((draft) =>
                appDom.setNodeNamespacedProp(draft, theme, 'theme', 'palette.secondary.main', {
                  type: 'const',
                  value: newValue,
                }),
              );
            }}
          />
        </Stack>
      ) : (
        <Button onClick={handleAddThemeClick}>Add theme</Button>
      )}
    </div>
  );
}
