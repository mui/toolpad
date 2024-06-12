import {
  Alert,
  Badge,
  Button,
  CloseReason,
  IconButton,
  Snackbar,
  SnackbarCloseReason,
  SnackbarContent,
  SnackbarProps,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import * as React from 'react';
import { useNonNullableContext } from '@toolpad/utils/react';
import { useSlotProps } from '@mui/base/utils';

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
  show: ShowNotification;
  close: CloseNotification;
}

const NotificationsContext = React.createContext<NotificationsContextValue | null>(null);

export interface NotificationsProviderSlotProps {
  snackbar: SnackbarProps;
}

type Slots<T> = { [K in keyof T]: React.ComponentType<T[K]> };

export type NotificationsProviderSlots = Slots<NotificationsProviderSlotProps>;

const RootPropsContext = React.createContext<NotificationsProviderProps | null>(null);

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

  const props = React.useContext(RootPropsContext);
  const SnackbarComponent = props?.slots?.snackbar ?? Snackbar;
  const snackbarSlotProps = useSlotProps({
    elementType: SnackbarComponent,
    ownerState: props,
    externalSlotProps: props?.slotProps?.snackbar,
    additionalProps: {
      open,
      autoHideDuration,
      onClose: handleClose,
      action,
    },
  });

  return (
    <SnackbarComponent key={notificationKey} {...snackbarSlotProps}>
      <Badge badgeContent={badge} color="primary" sx={{ width: '100%' }}>
        {severity ? (
          <Alert severity={severity} sx={{ width: '100%' }} action={action}>
            {message}
          </Alert>
        ) : (
          <SnackbarContent message={message} action={action} />
        )}
      </Badge>
    </SnackbarComponent>
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
  state: NotificationsState;
}

function Notifications({ state }: NotificationsUiProps) {
  const currentNotification = state.queue[0] ?? null;

  return currentNotification ? (
    <Notification
      {...currentNotification}
      badge={state.queue.length > 1 ? String(state.queue.length) : null}
    />
  ) : null;
}

export interface NotificationsProviderProps {
  children?: React.ReactNode;
  // eslint-disable-next-line react/no-unused-prop-types
  slots?: Partial<NotificationsProviderSlots>;
  // eslint-disable-next-line react/no-unused-prop-types
  slotProps?: Partial<NotificationsProviderSlotProps>;
}

let nextId = 1;

export function NotificationsProvider(props: NotificationsProviderProps) {
  const { children } = props;
  const [state, setState] = React.useState<NotificationsState>({ queue: [] });

  const show = React.useCallback<ShowNotification>((message, options = {}) => {
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
  }, []);

  const close = React.useCallback<CloseNotification>((key) => {
    setState((prev) => ({
      ...prev,
      queue: prev.queue.filter((n) => n.notificationKey !== key),
    }));
  }, []);

  const contextValue = React.useMemo(() => ({ show, close }), [show, close]);

  return (
    <RootPropsContext.Provider value={props}>
      <NotificationsContext.Provider value={contextValue}>
        {children}
        <Notifications state={state} />
      </NotificationsContext.Provider>
    </RootPropsContext.Provider>
  );
}
