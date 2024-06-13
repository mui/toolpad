import * as React from 'react';
import { useNotifications } from '@toolpad/core/useNotifications';
import Button from '@mui/material/Button';

export default function MultipleNotifications() {
  const notifications = useNotifications();
  return (
    <div>
      <Button
        onClick={() => {
          // preview-start
          notifications.show('Hello', { autoHideDuration: 1000 });
          notifications.show('Goodbye', { autoHideDuration: 1000 });
          // preview-end
        }}
      >
        Notify me
      </Button>
    </div>
  );
}
