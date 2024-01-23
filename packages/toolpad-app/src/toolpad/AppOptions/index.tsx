import * as React from 'react';
import { Divider, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CodeIcon from '@mui/icons-material/Code';
import useBoolean from '@mui/toolpad-utils/hooks/useBoolean';
import * as appDom from '@mui/toolpad-core/appDom';
import useMenu from '../../utils/useMenu';
import AppExportDialog from './AppExportDialog';

interface AppOptionsProps {
  dom?: appDom.AppDom;
}

function AppOptions({ dom }: AppOptionsProps) {
  const { buttonProps, menuProps, onMenuClose } = useMenu();

  const {
    setTrue: handleOpenAppExport,
    setFalse: handleCloseAppExport,
    value: appExportOpen,
  } = useBoolean(false);

  const handleAppExportClick = React.useCallback(() => {
    onMenuClose();
    handleOpenAppExport();
  }, [handleOpenAppExport, onMenuClose]);

  return (
    <React.Fragment>
      <IconButton {...buttonProps} aria-label="Application menu">
        <MoreVertIcon />
      </IconButton>
      <Menu {...menuProps}>
        <Divider />
        {dom ? (
          <MenuItem onClick={handleAppExportClick}>
            <ListItemIcon>
              <CodeIcon />
            </ListItemIcon>
            <ListItemText>View DOM</ListItemText>
          </MenuItem>
        ) : null}
      </Menu>
      {dom ? (
        <AppExportDialog open={appExportOpen} onClose={handleCloseAppExport} dom={dom} />
      ) : null}
    </React.Fragment>
  );
}

export default AppOptions;
