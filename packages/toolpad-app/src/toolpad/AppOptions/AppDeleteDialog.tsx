import * as React from 'react';
import client from '../../api';
import type { AppMeta } from '../../server/data';

import useLatest from '../../utils/useLatest';
import { ConfirmDialog } from '../../components/SystemDialogs';

export interface AppDeleteDialogProps {
  app: AppMeta | null;
  onClose: () => void;
  redirectOnDelete?: boolean;
}

const AppDeleteDialog = ({ app, onClose, redirectOnDelete }: AppDeleteDialogProps) => {
  const latestApp = useLatest(app);
  const deleteAppMutation = client.useMutation('deleteApp');
  const handleClose = React.useCallback(
    async (confirmed: boolean) => {
      if (confirmed && app) {
        await deleteAppMutation.mutateAsync([app.id]);
        await client.invalidateQueries('getApps');
        if (redirectOnDelete) {
          window.location.href = `/`;
        }
      }
      onClose();
    },
    [app, deleteAppMutation, onClose, redirectOnDelete],
  );

  return (
    <ConfirmDialog
      open={!!app}
      onClose={handleClose}
      severity="error"
      okButton="Delete"
      loading={deleteAppMutation.isLoading}
    >
      Are you sure you want to delete application &quot;{latestApp?.name}&quot;
    </ConfirmDialog>
  );
};

export default AppDeleteDialog;
