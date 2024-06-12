import * as React from 'react';
import { useNotifications } from '@toolpad/core/useNotifications';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

export default function CloseNotification() {
  const notifications = useNotifications();
  const [online, setOnline] = React.useState(true);
  const prevOnline = React.useRef(online);
  React.useEffect(() => {
    if (prevOnline.current === online) {
      return () => {};
    }
    prevOnline.current = online;

    // preview-start
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
    // preview-end
  }, [notifications, online]);

  return (
    <div>
      <FormControlLabel
        control={
          <Switch checked={online} onChange={() => setOnline((prev) => !prev)} />
        }
        label="Online"
      />
    </div>
  );
}
