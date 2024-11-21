import { Template } from '../types';

const ordersPage: Template = (options) => {
  const authEnabled = options.auth;
  const routerType = options.router;

  let imports = `import * as React from 'react';
import Typography from '@mui/material/Typography';`;

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
    requireAuth = `\n\nOrdersPage.requireAuth = true;`;
  }

  return `${imports}


export default ${isAsync}function OrdersPage() {
  ${sessionHandling}

  return (
    <Typography>
      Welcome to the Toolpad orders!
    </Typography>
  );
}${requireAuth}
`;
};

export default ordersPage;
