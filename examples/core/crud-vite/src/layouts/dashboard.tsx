import * as React from 'react';
import { Outlet, useLocation, useParams } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';

export default function Layout() {
  const { pathname } = useLocation();
  const { employeeId } = useParams();

  const title = React.useMemo(() => {
    if (pathname.endsWith('/employees/new')) {
      return 'New Employee';
    }
    if (employeeId && pathname.endsWith('/edit')) {
      return `Employee ${employeeId} - Edit`;
    }
    if (employeeId) {
      return `Employee ${employeeId}`;
    }
    return undefined;
  }, [employeeId, pathname]);

  return (
    <DashboardLayout>
      <PageContainer title={title}>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
}
