import * as React from 'react';
import {
  NotificationsProvider,
  useNotifications,
} from '@toolpad/core/useNotifications';
import Button from '@mui/material/Button';

export default function MultipleNotifications() {
  const notifications = useNotifications();
  return (
    <div>
      <NotificationsProvider />

      <Button
        onClick={async () => {
          await notifications.show('Hello', { autoHideDuration: 1000 });
          await notifications.show('Goodbye', { autoHideDuration: 1000 });
        }}
      >
        Notify me
      </Button>
    </div>
  );
}
