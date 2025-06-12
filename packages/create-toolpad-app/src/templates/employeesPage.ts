import { Template } from '../types';

const ordersPage: Template = (options) => {
  const authEnabled = options.auth;
  const routerType = options.router;
  const framework = options.framework;

  let imports = `${routerType === 'nextjs-app' ? `'use client';\n` : ''}import * as React from 'react';
${routerType === 'nextjs-pages' ? `import { useRouter } from 'next/router';` : ''}
${routerType === 'nextjs-app' ? `import { useParams } from 'next/navigation';` : ''}
${framework === 'vite' ? `import { useParams } from 'react-router';` : ''}
import { Crud } from '@toolpad/core/Crud';
import { employeesDataSource, Employee, employeesCache } from '${routerType === 'nextjs-app' ? `../../../` : ``}${routerType === 'nextjs-pages' ? `../` : ``}../data/employees';`;

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

  let requireAuth = '';
  if (authEnabled && routerType === 'nextjs-pages') {
    requireAuth = `\n\nEmployeesCrudPage.requireAuth = true;`;
  }

  return `${imports}


export default function EmployeesCrudPage() {
  ${
    routerType === 'nextjs-pages'
      ? `const router = useRouter();
  const { segments = [] } = router.query;
  const [employeeId] = segments;`
      : ''
  }
  ${
    routerType === 'nextjs-app'
      ? `const params = useParams();
  const [employeeId] = params.segments ?? [];`
      : ''
  }
  ${framework === 'vite' ? 'const { employeeId } = useParams();' : ''}
  
  ${sessionHandling}

  return ${routerType === 'nextjs-pages' ? `router.isReady ? ` : ''}(
    <Crud<Employee>
      dataSource={employeesDataSource}
      dataSourceCache={employeesCache}
      rootPath="/employees"
      initialPageSize={25}
      defaultValues={{ itemCount: 1 }}
      pageTitles={{
        show: \`Employee \${employeeId}\`,
        create: 'New Employee',
        edit: \`Employee \${employeeId} - Edit\`,
      }}
    />
  )${routerType === 'nextjs-pages' ? ` : null` : ''};
}${requireAuth}
`;
};

export default ordersPage;
