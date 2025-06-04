'use client';
import * as React from 'react';
import Stack from '@mui/material/Stack';
import { DashboardLayout, ThemeSwitcher } from '@toolpad/core/DashboardLayout';
import Copyright from '../components/Copyright';
import SidebarFooterAccount, { ToolbarAccountOverride } from './SidebarFooterAccount';

function CustomActions() {
  return (
    <Stack direction="row" alignItems="center">
      <ThemeSwitcher />
      <ToolbarAccountOverride />
    </Stack>
  );
}

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <DashboardLayout
      slots={{
        toolbarActions: CustomActions,
        sidebarFooter: SidebarFooterAccount,
      }}
    >
      {props.children}
      <Copyright sx={{ my: 4 }} />
    </DashboardLayout>
  );
}
