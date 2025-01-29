'use client';
import * as React from 'react';
import type { CloseDialog, OpenDialog } from './useDialogs';

/**
 * @ignore - internal component.
 */

export const DialogsContext = React.createContext<{
  open: OpenDialog;
  close: CloseDialog;
} | null>(null);
