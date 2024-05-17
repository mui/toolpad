import * as React from 'react';
import {
  NotificationsProvider,
  useNotifications,
} from '@toolpad/core/useNotifications';
import Button from '@mui/material/Button';

export default function DedupeNotification() {
  const notifications = useNotifications();
  return (
    // preview
    <div>
      <NotificationsProvider />
      <Button
        onClick={async () => {
          await notifications.show('Listen carefully, I will say this only once', {
            key: 'dedupe-notification',
            autoHideDuration: 5000,
          });
        }}
      >
        Notify me
      </Button>
    </div>
  );
}
