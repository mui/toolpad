import * as React from 'react';
import { Outlet, createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';

function Layout() {
  return (
    <DashboardLayout>
      <PageContainer>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
}

export const Route = createFileRoute('/_layout')({
  component: Layout,
});
