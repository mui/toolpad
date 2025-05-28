import * as React from 'react';
import { Outlet, createFileRoute, useLocation, useParams } from '@tanstack/react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';

function Layout() {
  const { pathname } = useLocation();
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { _splat } = useParams({ strict: false });

  const title = React.useMemo(() => {
    if (pathname.endsWith('/employees/new')) {
      return 'New Employee';
    }

    const employeeId = _splat?.split('/')[0];
    if (employeeId && pathname.endsWith('/edit')) {
      return `Employee ${employeeId} - Edit`;
    }
    if (employeeId) {
      return `Employee ${employeeId}`;
    }

    return undefined;
  }, [_splat, pathname]);

  return (
    <DashboardLayout>
      <PageContainer title={title}>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
}

export const Route = createFileRoute('/_layout')({
  component: Layout,
});
