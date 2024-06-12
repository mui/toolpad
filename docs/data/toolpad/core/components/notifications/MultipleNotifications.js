import * as React from 'react';
import { useNotifications } from '@toolpad/core/notifications';
import Button from '@mui/material/Button';

export default function MultipleNotifications() {
  const notifications = useNotifications();
  return (
    <div>
      <Button
        onClick={async () => {
          // preview-start
          await notifications.show('Hello', { autoHideDuration: 1000 });
          await notifications.show('Goodbye', { autoHideDuration: 1000 });
          // preview-end
        }}
      >
        Notify me
      </Button>
    </div>
  );
}
