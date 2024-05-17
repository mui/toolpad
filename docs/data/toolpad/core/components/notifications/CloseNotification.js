import * as React from 'react';
import {
  NotificationsProvider,
  useNotifications,
} from '@toolpad/core/useNotifications';
import { Switch } from '@mui/material';

export default function CloseNotification() {
  const notifications = useNotifications();
  const [online, setOnline] = React.useState(true);
  React.useEffect(() => {
    const key = online
      ? notifications.show('You are now online', {
          severity: 'success',
          autoHideDuration: 3000,
        })
      : notifications.show('You are now offline', {
          severity: 'error',
        });

    return () => {
      notifications.close(key);
    };
  }, [notifications, online]);
  return (
    <div>
      <NotificationsProvider />
      <Switch value={online} onChange={() => setOnline((prev) => !prev)} />
    </div>
  );
}
