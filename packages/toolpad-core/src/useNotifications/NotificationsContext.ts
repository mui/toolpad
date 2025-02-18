'use client';
import * as React from 'react';
import type { ShowNotification, CloseNotification } from './useNotifications';

/**
 * @ignore - internal component.
 */

export interface NotificationsContextValue {
  show: ShowNotification;
  close: CloseNotification;
}

export const NotificationsContext = React.createContext<NotificationsContextValue | null>(null);
