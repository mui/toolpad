import * as React from 'react';
import PropTypes from 'prop-types';
import { Menu, MenuItem, MenuList, Divider, ListItemIcon } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';

function CustomSettingsMenu(props) {
  const { open, anchorEl, handleMenuClose, handleEnter, handleLeave } = props;

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      slotProps={{
        root: {
          sx: {
            pointerEvents: 'none',
          },
        },
      }}
      anchorOrigin={{
        horizontal: 'right',
        vertical: 'top',
      }}
    >
      <MenuList
        dense
        disablePadding
        sx={{ pointerEvents: 'auto' }}
        onMouseEnter={() => {
          handleEnter();
        }}
        onMouseLeave={handleLeave}
      >
        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>My account</MenuItem>
      </MenuList>
    </Menu>
  );
}

CustomSettingsMenu.propTypes = {
  anchorEl: PropTypes.object,
  handleEnter: PropTypes.func.isRequired,
  handleLeave: PropTypes.func.isRequired,
  handleMenuClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default function CustomMenu() {
  const handleMenuNavigation = (route) => () => {
    console.log(
      'Toolpad Core Account Demo --- CustomMenuItems --- handleMenuNavigation --- route: ',
      route,
    );
  };

  const mouseOnSubMenu = React.useRef(false);

  const [subMenuAnchorEl, setSubMenuAnchorEl] = React.useState(null);
  const subMenuOpen = Boolean(subMenuAnchorEl);

  const handleTriggerEnter = React.useCallback((event) => {
    setSubMenuAnchorEl(event.currentTarget);
  }, []);

  const handleTriggerLeave = React.useCallback(() => {
    // Wait for 300ms to see if the mouse has moved to the sub menu
    setTimeout(() => {
      if (mouseOnSubMenu.current) {
        return;
      }
      setSubMenuAnchorEl(null);
    }, 300);
  }, []);

  const handleSubMenuEnter = React.useCallback(() => {
    mouseOnSubMenu.current = true;
  }, []);

  const handleSubMenuLeave = (event) => {
    mouseOnSubMenu.current = false;
    if (subMenuAnchorEl?.contains(event.relatedTarget)) {
      return;
    }
    setSubMenuAnchorEl(null);
  };

  const handleSubMenuClose = React.useCallback(() => {
    setSubMenuAnchorEl(null);
  }, []);

  return (
    <MenuList dense disablePadding>
      <MenuItem
        onMouseEnter={handleTriggerEnter}
        onMouseLeave={handleTriggerLeave}
        component="button"
        sx={{
          justifyContent: 'flex-start',
          width: '100%',
        }}
      >
        <ListItemIcon>
          <SettingsIcon />
        </ListItemIcon>
        Settings
      </MenuItem>
      <MenuItem
        onClick={handleMenuNavigation('/add-account')}
        component="button"
        sx={{
          justifyContent: 'flex-start',
          width: '100%',
        }}
      >
        <ListItemIcon>
          <AddIcon />
        </ListItemIcon>
        Add another account
      </MenuItem>

      <Divider />
      <CustomSettingsMenu
        open={subMenuOpen}
        anchorEl={subMenuAnchorEl}
        handleEnter={handleSubMenuEnter}
        handleLeave={handleSubMenuLeave}
        handleMenuClose={handleSubMenuClose}
      />
    </MenuList>
  );
}
