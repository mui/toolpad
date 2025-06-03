import * as React from 'react';
import { Outlet, createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';

function Layout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

export const Route = createFileRoute('/_layout')({
  component: Layout,
});
