import * as React from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import LoadingButton from '@mui/lab/LoadingButton';
import { Controller, useForm } from 'react-hook-form';
import DialogForm from '../../components/DialogForm';
import ErrorAlert from '../AppEditor/PageEditor/ErrorAlert';
import config from '../../config';
import useEvent from '../../utils/useEvent';
import client from '../../api';
import type { AppMeta } from '../../server/data';

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

export default AppSettingsDialog;
