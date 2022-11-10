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
import AppDeleteDialog from './AppDeleteDialog';
import AppDuplicateDialog from './AppDuplicateDialog';

interface AppOptionsProps {
  app?: AppMeta;
  onRename: () => void;
  allowDuplicate?: boolean;
  allowDelete?: boolean;
  dom?: any;
  redirectOnDelete?: boolean;
}

function AppOptions({
  app,
  onRename,
  allowDelete,
  allowDuplicate,
  dom,
  redirectOnDelete,
}: AppOptionsProps) {
  const { buttonProps, menuProps, onMenuClose } = useMenu();

  const [deletedApp, setDeletedApp] = React.useState<AppMeta | null>(null);
  const [duplicateApp, setDuplicateApp] = React.useState<AppMeta | null>(null);

  const onDuplicate = React.useCallback(() => {
    if (app) {
      setDuplicateApp(app);
    }
  }, [app]);

  const onDelete = React.useCallback(() => {
    if (app) {
      setDeletedApp(app);
    }
  }, [app]);

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
        {allowDuplicate ? (
          <MenuItem onClick={handleDuplicateClick}>
            <ListItemIcon>
              <ContentCopyOutlinedIcon />
            </ListItemIcon>
            <ListItemText>Duplicate</ListItemText>
          </MenuItem>
        ) : null}
        {allowDelete ? (
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
      <AppDeleteDialog
        app={deletedApp}
        onClose={() => setDeletedApp(null)}
        redirectOnDelete={redirectOnDelete}
      />
      <AppDuplicateDialog
        open={Boolean(duplicateApp)}
        app={duplicateApp}
        onClose={() => setDuplicateApp(null)}
      />
    </React.Fragment>
  );
}

export default AppOptions;
