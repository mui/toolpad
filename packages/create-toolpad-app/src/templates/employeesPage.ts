import { Template } from '../types';

const ordersPage: Template = (options) => {
  const authEnabled = options.auth;
  const routerType = options.router;

  let imports = `import * as React from 'react';
import Typography from '@mui/material/Typography';
import { Crud } from '@toolpad/core/Crud';
import { employeesDataSource, Employee, employeesCache } from '../data/employees';`;

  let sessionHandling = '';

  if (authEnabled) {
    if (routerType === 'nextjs-app') {
      if (options.hasNodemailerProvider || options.hasPasskeyProvider) {
        imports += `\nimport { redirect } from 'next/navigation';\nimport { headers } from 'next/headers';\nimport { auth } from '../../../auth';`;
        sessionHandling = `const session = await auth();
        const currentUrl = (await headers()).get('referer') || process.env.AUTH_URL || 'http://localhost:3000';
  
        if (!session) {
          const redirectUrl = new URL('/auth/signin', currentUrl);
          redirectUrl.searchParams.set('callbackUrl', currentUrl);
      
          redirect(redirectUrl.toString());
        }
        `;
      }
    }
  }

  const isAsync = authEnabled && routerType === 'nextjs-app' ? 'async ' : '';

  let requireAuth = '';
  if (authEnabled && routerType === 'nextjs-pages') {
    requireAuth = `\n\nEmployeesCrudPage.requireAuth = true;`;
  }

  return `${imports}


export default ${isAsync}function EmployeesCrudPage() {
  ${sessionHandling}

  return (
    <Crud<Employee>
      dataSource={employeesDataSource}
      dataSourceCache={employeesCache}
      rootPath="/employees"
      initialPageSize={25}
      defaultValues={{ itemCount: 1 }}
    />
  );
}${requireAuth}
`;
};

export default ordersPage;
