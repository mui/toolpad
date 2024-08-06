import * as React from 'react';
import Button from '@mui/material/Button';
import Frame from 'docs/src/components/action/Frame';
import Paper from '@mui/material/Paper';
import { HighlightedCode } from '@mui/docs/HighlightedCode';
import { useNotifications, NotificationsProvider } from '@toolpad/core/useNotifications';

const code = `
export default function BasicNotification() {
  const notifications = useNotifications();
  return (
    <div>
      <Button
        onClick={() => {
          notifications.show('Consider yourself notified!', {
            autoHideDuration: 3000,
          });
        }}
      >
        Notify me
      </Button>
    </div>
  );
}`;

function BasicNotification() {
  const notifications = useNotifications();
  return (
    <div style={{ margin: 'auto' }}>
      <Button
        onClick={() => {
          notifications.show('Consider yourself notified!', {
            autoHideDuration: 3000,
          });
        }}
      >
        Notify me
      </Button>
    </div>
  );
}

export default function ToolpadNotificationDemo() {
  return (
    <Frame sx={{ height: '100%' }}>
      <Frame.Demo sx={{ p: 2 }}>
        <Paper
          variant="outlined"
          sx={(theme) => ({
            p: 2,
            display: 'flex',
            alignItems: 'center',
            maxWidth: '100%',
            mx: 'auto',
            bgcolor: '#FFF',
            borderRadius: '8px',
            ...theme.applyDarkStyles({
              bgcolor: 'primaryDark.900',
            }),
          })}
        >
          <NotificationsProvider>
            <BasicNotification />
          </NotificationsProvider>
        </Paper>
      </Frame.Demo>
      <Frame.Info data-mui-color-scheme="dark" sx={{ maxHeight: 600, overflow: 'auto' }}>
        <HighlightedCode copyButtonHidden plainStyle code={code} language="jsx" />
      </Frame.Info>
    </Frame>
  );
}
