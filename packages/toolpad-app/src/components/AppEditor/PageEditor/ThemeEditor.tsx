import * as React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Stack, Button } from '@mui/material';
import * as appDom from '../../../appDom';
import { WithControlledProp } from '../../../utils/types';
import { useDom, useDomApi } from '../../DomLoader';

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
    <FormControl size="small" fullWidth>
      <InputLabel id="select-color">{name}</InputLabel>
      <Select
        labelId="select-color"
        size="small"
        value={value}
        label={name}
        onChange={(event) => onChange(event.target.value)}
      >
        {THEME_COLORS.map((color) => (
          <MenuItem key={color} value={color}>
            {color}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export interface ComponentEditorProps {
  className?: string;
}

export default function ComponentEditor({ className }: ComponentEditorProps) {
  const dom = useDom();
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
    domApi.addNode(newTheme, app, 'themes');
  };

  return (
    <div className={className}>
      {theme ? (
        <Stack spacing={2}>
          <PaletteColorPicker
            name="primary"
            value={appDom.fromConstPropValue(theme.theme['palette.primary.main']) || ''}
            onChange={(newValue) => {
              domApi.setNodeNamespacedProp(theme, 'theme', 'palette.primary.main', {
                type: 'const',
                value: newValue,
              });
            }}
          />
          <PaletteColorPicker
            name="secondary"
            value={appDom.fromConstPropValue(theme.theme['palette.secondary.main']) || ''}
            onChange={(newValue) =>
              domApi.setNodeNamespacedProp(theme, 'theme', 'palette.secondary.main', {
                type: 'const',
                value: newValue,
              })
            }
          />
        </Stack>
      ) : (
        <Button onClick={handleAddThemeClick}>Add theme</Button>
      )}
    </div>
  );
}
