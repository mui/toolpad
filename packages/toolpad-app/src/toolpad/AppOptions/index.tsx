import * as React from 'react';
import { Divider, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import CodeIcon from '@mui/icons-material/Code';
import useMenu from '../../utils/useMenu';
import type { AppMeta } from '../../server/data';
import useBoolean from '../../utils/useBoolean';
import AppSettingsDialog from './AppSettingsDialog';
import AppExportDialog from './AppExportDialog';

interface AppOptionsProps {
  app?: AppMeta;
  onRename: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  dom?: any;
}

function AppOptions({ app, onRename, onDelete, onDuplicate, dom }: AppOptionsProps) {
  const { buttonProps, menuProps, onMenuClose } = useMenu();

  const handleRenameClick = React.useCallback(() => {
    onMenuClose();
    onRename();
  }, [onMenuClose, onRename]);

  const handleDeleteClick = React.useCallback(() => {
    onMenuClose();
    onDelete?.();
  }, [onDelete, onMenuClose]);

  const handleDuplicateClick = React.useCallback(() => {
    onMenuClose();
    onDuplicate?.();
  }, [onDuplicate, onMenuClose]);

  const {
    setTrue: handleOpenSettings,
    setFalse: handleCloseSettings,
    value: settingsOpen,
  } = useBoolean(false);

  const handleopenSettingsClick = React.useCallback(() => {
    onMenuClose();
    handleOpenSettings();
  }, [handleOpenSettings, onMenuClose]);

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
      <IconButton {...buttonProps} aria-label="Application menu" disabled={!app}>
        <MoreVertIcon />
      </IconButton>
      <Menu {...menuProps}>
        <MenuItem onClick={handleRenameClick}>
          <ListItemIcon>
            <DriveFileRenameOutlineIcon />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        {onDuplicate ? (
          <MenuItem onClick={handleDuplicateClick}>
            <ListItemIcon>
              <ContentCopyOutlinedIcon />
            </ListItemIcon>
            <ListItemText>Duplicate</ListItemText>
          </MenuItem>
        ) : null}
        {onDelete ? (
          <MenuItem onClick={handleDeleteClick}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        ) : null}
        <Divider />
        {dom ? (
          <MenuItem onClick={handleAppExportClick}>
            <ListItemIcon>
              <CodeIcon />
            </ListItemIcon>
            <ListItemText>View DOM</ListItemText>
          </MenuItem>
        ) : null}
        <MenuItem onClick={handleopenSettingsClick}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
      </Menu>
      {app && dom ? (
        <AppExportDialog open={appExportOpen} onClose={handleCloseAppExport} dom={dom} />
      ) : null}
      {app ? (
        <AppSettingsDialog open={settingsOpen} onClose={handleCloseSettings} app={app} />
      ) : null}
    </React.Fragment>
  );
}

export default AppOptions;
