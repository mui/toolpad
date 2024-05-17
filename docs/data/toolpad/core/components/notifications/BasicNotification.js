import * as React from 'react';
import {
  NotificationsProvider,
  useNotifications,
} from '@toolpad/core/useNotifications';
import Button from '@mui/material/Button';

function DemoContent() {
  const notifications = useNotifications();
  return (
    // preview
    <div>
      <Button
        onClick={async () => {
          await notifications.enqueue('Consider yourself notified!', {
            // autoHideDuration: 3000,
          });
        }}
      >
        Notify me
      </Button>
    </div>
  );
}

export default function BasicNotification() {
  return (
    <NotificationsProvider>
      <DemoContent />
    </NotificationsProvider>
  );
}
