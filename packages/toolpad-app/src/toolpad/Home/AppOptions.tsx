import * as React from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Divider,
  FormControlLabel,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { Controller, useForm } from 'react-hook-form';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import DialogForm from '../../components/DialogForm';
import ErrorAlert from '../AppEditor/PageEditor/ErrorAlert';
import useMenu from '../../utils/useMenu';
import useBoolean from '../../utils/useBoolean';
import config from '../../config';
import type { AppMeta } from '../../server/data';
import useEvent from '../../utils/useEvent';
import client from '../../api';

interface AppSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  app: AppMeta;
}

function AppSettingsDialog({ app, open, onClose }: AppSettingsDialogProps) {
  const updateAppMutation = client.useMutation('updateApp');

  const { handleSubmit, reset, control } = useForm({
    defaultValues: {
      public: app.public,
    },
  });

  const handleClose = useEvent(() => {
    onClose();
    reset();
    updateAppMutation.reset();
  });

  const doSubmit = handleSubmit(async (updates) => {
    await updateAppMutation.mutateAsync([app.id, updates]);
    onClose();
  });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogForm onSubmit={doSubmit}>
        <DialogTitle>Application settings for &quot;{app.name}&quot;</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Controller
                control={control}
                name="public"
                render={({ field: { value, onChange, ...field } }) => (
                  <Checkbox
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={config.isDemo}
                    {...field}
                  />
                )}
              />
            }
            label="Make application public"
            disabled={config.isDemo}
          />
          {updateAppMutation.error ? <ErrorAlert error={updateAppMutation.error} /> : null}
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="text" onClick={handleClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" loading={updateAppMutation.isLoading}>
            Save
          </LoadingButton>
        </DialogActions>
      </DialogForm>
    </Dialog>
  );
}

interface AppOptionsProps {
  app?: AppMeta;
  onRename: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

function AppOptions({ app, onRename, onDelete, onDuplicate }: AppOptionsProps) {
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
        <MenuItem onClick={handleDuplicateClick}>
          <ListItemIcon>
            <ContentCopyOutlinedIcon />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleopenSettingsClick}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
      </Menu>
      {app ? (
        <AppSettingsDialog open={settingsOpen} onClose={handleCloseSettings} app={app} />
      ) : null}
    </React.Fragment>
  );
}

export default AppOptions;
