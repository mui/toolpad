import { Template } from '../../types';

const dashboardTemplate: Template = (options) => {
  const { auth } = options;

  return `import * as React from 'react';${auth ? `\nimport LinearProgress from '@mui/material/LinearProgress';` : ``}
import { Outlet, useLocation, useParams } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
${
  auth
    ? `import { Account } from '@toolpad/core/Account';

import { useSession } from '../SessionContext';

function CustomAccount() {
  return (
    <Account
      slotProps={{
        preview: { slotProps: { avatarIconButton: { sx: { border: '0' } } } },
      }}
    />
  );
}`
    : ''
}

export default function Layout() {
  const { pathname } = useLocation();
  const { employeeId } = useParams();

  const title = React.useMemo(() => {
    if (pathname.endsWith('/employees/new')) {
      return 'New Employee';
    }
    if (employeeId && pathname.endsWith('/edit')) {
      return \`Employee \${employeeId} - Edit\`;
    }
    if (employeeId) {
      return \`Employee \${employeeId}\`;
    }
    return undefined;
  }, [employeeId, pathname]);

  ${
    auth
      ? `const { session, loading } = useSession();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ width: '100%' }}>
        <LinearProgress />
      </div>
    );
  }

  if (!session) {
    const redirectTo = \`/sign-in?callbackUrl=\${encodeURIComponent(location.pathname)}\`;
    return <Navigate to={redirectTo} replace />;
  }`
      : ''
  }

  return (
    <DashboardLayout title={title} ${auth ? ` slots={{ toolbarAccount: CustomAccount }}` : ''}>
      <PageContainer>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
}`;
};

export default dashboardTemplate;
