import * as React from 'react';
import { Divider, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import CodeIcon from '@mui/icons-material/Code';
import invariant from 'invariant';
import useMenu from '../../utils/useMenu';
import type { AppMeta } from '../../server/data';
import useBoolean from '../../utils/useBoolean';
import AppSettingsDialog from './AppSettingsDialog';
import AppExportDialog from './AppExportDialog';
import AppDeleteDialog from './AppDeleteDialog';
import AppDuplicateDialog from './AppDuplicateDialog';
import config from '../../config';

interface AppOptionsProps {
  app?: AppMeta | null;
  onRenameRequest: () => void;
  dom?: any;
  redirectOnDelete?: boolean;
}

function AppOptions({ app, onRenameRequest: onRename, dom, redirectOnDelete }: AppOptionsProps) {
  const { buttonProps, menuProps, onMenuClose } = useMenu();

  const [deletedApp, setDeletedApp] = React.useState<AppMeta | null>(null);
  const [duplicateApp, setDuplicateApp] = React.useState<AppMeta | null>(null);

  const onDuplicate = React.useCallback(() => {
    invariant(app, "This action shouln't be enabled when no app is available");
    setDuplicateApp(app);
  }, [app]);

  const onDelete = React.useCallback(() => {
    invariant(app, "This action shouln't be enabled when no app is available");
    setDeletedApp(app);
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
      <IconButton {...buttonProps} aria-label="Application menu">
        <MoreVertIcon />
      </IconButton>
      <Menu {...menuProps}>
        {config.localMode ? null : (
          <MenuItem onClick={handleRenameClick}>
            <ListItemIcon>
              <DriveFileRenameOutlineIcon />
            </ListItemIcon>
            <ListItemText>Rename</ListItemText>
          </MenuItem>
        )}
        {config.localMode ? null : (
          <MenuItem onClick={handleDuplicateClick} disabled={!app}>
            <ListItemIcon>
              <ContentCopyOutlinedIcon />
            </ListItemIcon>
            <ListItemText>Duplicate</ListItemText>
          </MenuItem>
        )}
        {config.localMode ? null : (
          <MenuItem onClick={handleDeleteClick} disabled={!app}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
        <Divider />
        {dom ? (
          <MenuItem onClick={handleAppExportClick}>
            <ListItemIcon>
              <CodeIcon />
            </ListItemIcon>
            <ListItemText>View DOM</ListItemText>
          </MenuItem>
        ) : null}
        {config.localMode ? null : (
          <MenuItem onClick={handleopenSettingsClick} disabled={!app}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
        )}
      </Menu>
      {dom ? (
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
      {app ? (
        <AppDuplicateDialog
          open={Boolean(duplicateApp)}
          app={app}
          onClose={() => setDuplicateApp(null)}
        />
      ) : null}
    </React.Fragment>
  );
}

export default AppOptions;
