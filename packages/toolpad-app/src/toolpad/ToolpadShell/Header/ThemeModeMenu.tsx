import * as React from 'react';
import { IconButton, Menu, MenuItem, ListItemText, ListItemIcon, Tooltip } from '@mui/material';
import LightModeOutlined from '@mui/icons-material/LightMode';
import DarkModeOutlined from '@mui/icons-material/DarkMode';
import SettingsBrightnessOutlined from '@mui/icons-material/SettingsBrightnessOutlined';
import { ThemeMode } from '../../../ThemeContext';
import useMenu from '../../../utils/useMenu';

interface ThemeModeMenuProps {
  mode: ThemeMode;
  onChange: (event: React.MouseEvent, mode: ThemeMode) => void;
}

interface ThemeModeMenuOption {
  label: string;
  icon: React.ReactNode;
  value: ThemeMode;
}

const options: Record<string, ThemeModeMenuOption> = {
  light: {
    label: 'Light',
    value: 'light',
    icon: <LightModeOutlined />,
  },
  dark: {
    label: 'Dark',
    value: 'dark',
    icon: <DarkModeOutlined />,
  },
  system: {
    label: 'System',
    value: 'system',
    icon: <SettingsBrightnessOutlined />,
  },
};

function ThemeModeMenu({ mode, onChange }: ThemeModeMenuProps) {
  const { buttonProps, menuProps, onMenuClose } = useMenu();

  return (
    <React.Fragment>
      <Tooltip title="Change theme">
        <IconButton {...buttonProps} aria-label="Change theme" color="primary">
          {options[mode].icon}
        </IconButton>
      </Tooltip>

      <Menu {...menuProps}>
        {Object.values(options).map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === mode}
            onClick={(event) => {
              onChange(event, option.value);
              onMenuClose();
            }}
          >
            <ListItemIcon>{option.icon}</ListItemIcon>
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Menu>
    </React.Fragment>
  );
}

export default ThemeModeMenu;
