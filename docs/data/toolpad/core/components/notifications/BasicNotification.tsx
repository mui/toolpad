import * as React from 'react';
import {
  NotificationsProvider,
  useNotifications,
} from '@toolpad/core/useNotifications';
import Button from '@mui/material/Button';

export default function BasicNotification() {
  const notifications = useNotifications();
  return (
    // preview
    <div>
      <NotificationsProvider />
      <Button
        onClick={async () => {
          await notifications.show('Consider yourself notified!', {
            autoHideDuration: 3000,
          });
        }}
      >
        Notify me
      </Button>
    </div>
  );
}
