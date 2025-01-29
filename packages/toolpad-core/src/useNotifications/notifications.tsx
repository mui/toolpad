import * as React from 'react';
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
import { useNonNullableContext } from '@toolpad/utils/react';
import useSlotProps from '@mui/utils/useSlotProps';
import { NotificationsContext } from './NotificationsContext';
import type {
  CloseNotification,
  ShowNotification,
  ShowNotificationOptions,
} from './useNotifications';

const closeText = 'Close';

export interface NotificationsProviderSlotProps {
  snackbar: SnackbarProps;
}

export interface NotificationsProviderSlots {
  /**
   * The component that renders the snackbar.
   * @default Snackbar
   */
  snackbar: React.ElementType;
}

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

interface NotificationQueueEntry {
  notificationKey: string;
  options: ShowNotificationOptions;
  open: boolean;
  message: React.ReactNode;
}

interface NotificationsState {
  queue: NotificationQueueEntry[];
}

interface NotificationsProps {
  subscribe: (cb: () => void) => () => void;
  getState: () => NotificationsState;
}

function Notifications({ subscribe, getState }: NotificationsProps) {
  const state = React.useSyncExternalStore(subscribe, getState, getState);
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

let nextId = 0;
const generateId = () => {
  const id = nextId;
  nextId += 1;
  return id;
};

interface NotificationsApi {
  show: ShowNotification;
  close: CloseNotification;
  Provider: React.ComponentType<NotificationsProviderProps>;
}

export function createNotifications(): NotificationsApi {
  let state: NotificationsState = { queue: [] };
  const listeners = new Set<() => void>();

  const getState = () => state;
  const subscribeState = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  const fireUpdateEvent = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  const show: ShowNotification = (message, options = {}) => {
    const notificationKey = options.key ?? `::toolpad-internal::notification::${generateId()}`;
    if (!state.queue.some((n) => n.notificationKey === notificationKey)) {
      state = {
        ...state,
        queue: [...state.queue, { message, options, notificationKey, open: true }],
      };
      fireUpdateEvent();
    }

    return notificationKey;
  };

  const close: CloseNotification = (key) => {
    state = {
      ...state,
      queue: state.queue.filter((n) => n.notificationKey !== key),
    };
    fireUpdateEvent();
  };

  const contextValue = { show, close };

  /**
   * Provider for Notifications. The subtree of this component can use the `useNotifications` hook to
   * access the notifications API. The notifications are shown in the same order they are requested.
   *
   * Demos:
   *
   * - [Sign-in Page](https://mui.com/toolpad/core/react-sign-in-page/)
   * - [useNotifications](https://mui.com/toolpad/core/react-use-notifications/)
   *
   * API:
   *
   * - [NotificationsProvider API](https://mui.com/toolpad/core/api/notifications-provider)
   */
  function Provider(props: NotificationsProviderProps) {
    return (
      <RootPropsContext.Provider value={props}>
        <NotificationsContext.Provider value={contextValue}>
          {props.children}
          <Notifications getState={getState} subscribe={subscribeState} />
        </NotificationsContext.Provider>
      </RootPropsContext.Provider>
    );
  }

  return {
    show,
    close,
    Provider,
  };
}

const { show, close, Provider } = createNotifications();

export { show, close, Provider as NotificationsProvider };
