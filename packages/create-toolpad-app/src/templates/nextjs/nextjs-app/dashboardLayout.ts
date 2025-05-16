const dashboardLayout = `'use client';
import * as React from 'react';
import { usePathname, useParams } from 'next/navigation';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';

export default function Layout(props: { children: React.ReactNode }) {
const pathname = usePathname();
  const params = useParams();
  const [employeeId] = params.segments ?? [];

  const title = React.useMemo(() => {
    if (pathname.endsWith('/employees/new')) {
      return 'New Employee';
    }
    if (employeeId && pathname.endsWith('/employees/edit')) {
      return \`Employee \${employeeId} - Edit\`;
    }
    if (employeeId) {
      return \`Employee \${employeeId}\`;
    }
    return undefined;
  }, [employeeId, pathname]);

  return (
    <DashboardLayout>
      <PageContainer title={title}>{props.children}</PageContainer>
    </DashboardLayout>
  );
}  
`;

export default dashboardLayout;
