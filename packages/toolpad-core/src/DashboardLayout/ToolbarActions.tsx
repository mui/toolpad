'use client';
import * as React from 'react';
import Stack from '@mui/material/Stack';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Account } from '../Account';

/**
 *
 * Demos:
 *
 * - [Dashboard Layout](https://mui.com/toolpad/core/react-dashboard-layout/)
 *
 * API:
 *
 * - [ToolbarActions API](https://mui.com/toolpad/core/api/toolbar-actions)
 */
function ToolbarActions() {
  return (
    <Stack direction="row" alignItems="center">
      <ThemeSwitcher />
      <Account />
    </Stack>
  );
}

export { ToolbarActions };
