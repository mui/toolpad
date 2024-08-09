import * as React from 'react';
import {
  NotificationsProvider,
  useNotifications,
} from '@toolpad/core/useNotifications';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';

const notificationsProviderSlots = {
  snackbar: styled(Snackbar)({ position: 'absolute' }),
};

function ScopedContent() {
  const notifications = useNotifications();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Button
        onClick={() => {
          notifications.show('Consider yourself notified!', {
            autoHideDuration: 3000,
          });
        }}
      >
        Notify me
      </Button>
    </Box>
  );
}

export default function ScopedNotification() {
  return (
    <Box sx={{ width: '100%', height: 150, position: 'relative' }}>
      <NotificationsProvider slots={notificationsProviderSlots}>
        <ScopedContent />
      </NotificationsProvider>
    </Box>
  );
}
