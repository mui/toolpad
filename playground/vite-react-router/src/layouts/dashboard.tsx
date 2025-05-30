import * as React from 'react';
import { Outlet, useLocation, useParams } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';

export default function Layout() {
  const { pathname } = useLocation();
  const { orderId } = useParams();

  const title = React.useMemo(() => {
    if (pathname.endsWith('/orders/new')) {
      return 'New Order';
    }
    if (orderId && pathname.endsWith('/edit')) {
      return `Order ${orderId} - Edit`;
    }
    if (orderId) {
      return `Order ${orderId}`;
    }
    return undefined;
  }, [orderId, pathname]);

  return (
    <DashboardLayout>
      <PageContainer title={title}>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
}
