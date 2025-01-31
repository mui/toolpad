import * as React from 'react';
import { Outlet, useLocation, useParams, matchPath } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';

export default function Layout() {
  const location = useLocation();
  const { orderId } = useParams();

  const title = React.useMemo(() => {
    if (matchPath('/orders/:orderId/edit', location.pathname)) {
      return `Order ${orderId} - Edit`;
    }
    if (orderId) {
      return `Order ${orderId}`;
    }
    if (location.pathname === '/orders/new') {
      return 'New Order';
    }
    return undefined;
  }, [location.pathname, orderId]);

  return (
    <DashboardLayout>
      <PageContainer title={title}>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
}
