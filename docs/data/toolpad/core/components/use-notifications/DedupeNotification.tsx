import * as React from 'react';
import { useNotifications } from '@toolpad/core/useNotifications';
import Button from '@mui/material/Button';

export default function DedupeNotification() {
  const notifications = useNotifications();
  return (
    // preview
    <div>
      <Button
        onClick={() => {
          // preview-start
          notifications.show('Listen carefully, I will say this only once', {
            key: 'dedupe-notification',
            autoHideDuration: 5000,
          });
          // preview-end
        }}
      >
        Notify me
      </Button>
    </div>
  );
}
