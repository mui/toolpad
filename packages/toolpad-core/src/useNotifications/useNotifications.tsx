import {
  Alert,
  AlertProps,
  Badge,
  Button,
  CloseReason,
  IconButton,
  Snackbar,
  SnackbarCloseReason,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import * as React from 'react';

const closeText = 'Close';

export interface EnqueueNotificationOptions {
  key?: string; // To dedupe snackbars
  severity?: 'info' | 'warning' | 'error' | 'success';
  autoHideDuration?: number;
  actionText?: React.ReactNode;
  onAction?: () => void;
}

export interface EnqueueNotification {
  (msg: React.ReactNode, options?: EnqueueNotificationOptions): string;
}

export interface CloseNotification {
  (key: string): void;
}

const EnqueueNotificationContext = React.createContext<EnqueueNotification>(() => {
  throw new Error('No NotificationsProvider');
});

const CloseNotificationContext = React.createContext<CloseNotification>(() => {
  throw new Error('No NotificationsProvider');
});

interface NotificationQueueEntry {
  notificationKey: string;
  options: EnqueueNotificationOptions;
  open: boolean;
  msg: React.ReactNode;
}

interface NotificationProps {
  notificationKey: string;
  badge: string | null;
  open: boolean;
  msg: React.ReactNode;
  options: EnqueueNotificationOptions;
}

function PassThrough({ children }: AlertProps) {
  return children;
}

function Notification({ notificationKey, open, msg, options, badge }: NotificationProps) {
  const close = React.useContext(CloseNotificationContext);

  const { severity, actionText, onAction, autoHideDuration } = options;

  const handleClose = React.useCallback(
    (event: unknown, reason?: CloseReason | SnackbarCloseReason) => {
      if (reason === 'clickaway') {
        return;
      }
      close(notificationKey);
    },
    [notificationKey, close],
  );

  const action = (
    <React.Fragment>
      {onAction ? (
        <Button color="inherit" size="small" onClick={onAction}>
          {actionText ?? 'Action'}
        </Button>
      ) : null}
      <IconButton
        size="small"
        aria-label={closeText}
        title={closeText}
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  const AlertComponent: React.ComponentType<AlertProps> = severity ? Alert : PassThrough;

  return (
    <Snackbar
      key={notificationKey}
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      action={action}
    >
      <Badge badgeContent={badge} color="primary">
        <AlertComponent severity={severity ?? 'info'} sx={{ width: '100%' }} action={action}>
          {msg}
        </AlertComponent>
      </Badge>
    </Snackbar>
  );
}

interface NotificationsState {
  queue: NotificationQueueEntry[];
}

export interface NotificationsProviderProps {
  children?: React.ReactNode;
}

let nextId = 1;

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const [state, setState] = React.useState<NotificationsState>({ queue: [] });

  const enqueue = React.useCallback<EnqueueNotification>((msg, options = {}) => {
    const notificationKey = options.key ?? `::toolpad-internal::notification::${nextId}`;
    nextId += 1;
    setState((prev) => {
      if (prev.queue.some((n) => n.notificationKey === notificationKey)) {
        // deduplicate by key
        return prev;
      }
      return {
        ...prev,
        queue: [...prev.queue, { msg, options, notificationKey, open: true }],
      };
    });
    return notificationKey;
  }, []);

  const close = React.useCallback<CloseNotification>((key) => {
    setState((prev) => ({
      ...prev,
      queue: prev.queue.filter((n) => n.notificationKey !== key),
    }));
  }, []);

  const currentNotification = state.queue[0] ?? null;

  return (
    <EnqueueNotificationContext.Provider value={enqueue}>
      <CloseNotificationContext.Provider value={close}>
        {children}

        {currentNotification ? (
          <Notification
            {...currentNotification}
            badge={state.queue.length > 1 ? String(state.queue.length) : null}
          />
        ) : null}
      </CloseNotificationContext.Provider>
    </EnqueueNotificationContext.Provider>
  );
}

export function useNotifications() {
  const enqueue = React.useContext(EnqueueNotificationContext);
  const close = React.useContext(CloseNotificationContext);
  return React.useMemo(
    () => ({
      enqueue,
      close,
    }),
    [enqueue, close],
  );
}
