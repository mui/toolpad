'use client';
import * as React from 'react';
import { usePathname, useParams } from 'next/navigation';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';

export default function DashboardPagesLayout(props: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const [orderId] = params.segments ?? [];

  const title = React.useMemo(() => {
    if (pathname === '/orders/new') {
      return 'New Order';
    }
    if (orderId && pathname.includes('/edit')) {
      return `Order ${orderId} - Edit`;
    }
    if (orderId) {
      return `Order ${orderId}`;
    }
    return undefined;
  }, [orderId, pathname]);

  return (
    <DashboardLayout>
      <PageContainer title={title}>{props.children}</PageContainer>
    </DashboardLayout>
  );
}
