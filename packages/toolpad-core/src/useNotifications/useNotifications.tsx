import {
  Alert,
  Badge,
  Button,
  CloseReason,
  IconButton,
  Snackbar,
  SnackbarCloseReason,
  SnackbarContent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import * as React from 'react';
import { createGlobalState, useNonNullableContext } from '@toolpad/utils/react';

const closeText = 'Close';

export interface ShowNotificationOptions {
  key?: string; // To dedupe snackbars
  severity?: 'info' | 'warning' | 'error' | 'success';
  autoHideDuration?: number;
  actionText?: React.ReactNode;
  onAction?: () => void;
}

export interface ShowNotification {
  (message: React.ReactNode, options?: ShowNotificationOptions): string;
}

export interface CloseNotification {
  (key: string): void;
}

interface NotificationQueueEntry {
  notificationKey: string;
  options: ShowNotificationOptions;
  open: boolean;
  message: React.ReactNode;
}

interface NotificationsState {
  queue: NotificationQueueEntry[];
}

interface NotificationsContextValue {
  getState: () => NotificationsState;
  subscribe: (cb: () => void) => () => void;
  show: ShowNotification;
  close: CloseNotification;
}

function createNotificationsContext(): NotificationsContextValue | null {
  if (typeof window === 'undefined') {
    return null;
  }

  let nextId = 1;
  let state: NotificationsState = { queue: [] };
  // Only one subscriber allowed, last one wins
  const subscribers = new Set<() => void>();

  const setState: React.Dispatch<React.SetStateAction<NotificationsState>> = (newState) => {
    state = typeof newState === 'function' ? newState(state) : newState;
    Array.from(subscribers).forEach((cb) => cb());
  };

  return {
    getState: () => state,
    subscribe: (cb) => {
      subscribers.add(cb);
      return () => {
        subscribers.delete(cb);
      };
    },
    show: (message, options = {}) => {
      const notificationKey = options.key ?? `::toolpad-internal::notification::${nextId}`;
      nextId += 1;
      setState((prev) => {
        if (prev.queue.some((n) => n.notificationKey === notificationKey)) {
          // deduplicate by key
          return prev;
        }
        return {
          ...prev,
          queue: [...prev.queue, { message, options, notificationKey, open: true }],
        };
      });
      return notificationKey;
    },
    close: (key) => {
      setState((prev) => ({
        ...prev,
        queue: prev.queue.filter((n) => n.notificationKey !== key),
      }));
    },
  };
}

const NotificationsContext = React.createContext(createNotificationsContext());

interface NotificationProps {
  notificationKey: string;
  badge: string | null;
  open: boolean;
  message: React.ReactNode;
  options: ShowNotificationOptions;
}

function Notification({ notificationKey, open, message, options, badge }: NotificationProps) {
  const { close } = useNonNullableContext(NotificationsContext);

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

  return (
    <Snackbar
      key={notificationKey}
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      action={action}
    >
      <Badge badgeContent={badge} color="primary" sx={{ width: '100%' }}>
        {severity ? (
          <Alert severity={severity} sx={{ width: '100%' }} action={action}>
            {message}
          </Alert>
        ) : (
          <SnackbarContent message={message} action={action} />
        )}
      </Badge>
    </Snackbar>
  );
}

interface UseNotifications {
  show: ShowNotification;
  close: CloseNotification;
}

const serverNotifications: UseNotifications = {
  show: () => {
    throw new Error('Not supported on server side');
  },
  close: () => {
    throw new Error('Not supported on server side');
  },
};

export function useNotifications(): UseNotifications {
  const context = React.useContext(NotificationsContext);

  if (context) {
    const { show, close } = context;
    return { show, close };
  }

  return serverNotifications;
}

interface NotificationsUiProps {
  context: NotificationsContextValue;
}

function Notifications({ context }: NotificationsUiProps) {
  const getServerState = React.useCallback(() => ({ queue: [] }), []);
  const state: NotificationsState = React.useSyncExternalStore(
    context.subscribe,
    context.getState,
    getServerState,
  );

  const currentNotification = state.queue[0] ?? null;

  return currentNotification ? (
    <Notification
      {...currentNotification}
      badge={state.queue.length > 1 ? String(state.queue.length) : null}
    />
  ) : null;
}

const master = createGlobalState<string | null>(null);

export interface NotificationsProviderProps {
  children?: React.ReactNode;
}

export function NotificationsProvider() {
  const context = React.useContext(NotificationsContext);

  const id = React.useId();
  const [masterId] = master.useState();

  React.useEffect(() => {
    master.setState((prev) => (prev === null ? id : prev));
    return () => {
      master.setState((prev) => (prev === id ? null : prev));
    };
  }, [id]);

  if (!context || masterId !== id) {
    return null;
  }

  return <Notifications context={context} />;
}
