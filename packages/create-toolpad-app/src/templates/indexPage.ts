import { SupportedRouter } from '../types';

const indexPage = (authEnabled: boolean, routerType: SupportedRouter) => {
  let imports = `import * as React from 'react';
import Typography from '@mui/material/Typography';`;

  let sessionHandling = '';
  let welcomeMessage = `Welcome to <Link href="https://mui.com/toolpad/core/introduction">Toolpad Core!</Link>`;

  if (authEnabled) {
    if (routerType === 'nextjs-app') {
      imports += `\nimport { auth } from '../../auth';`;
      sessionHandling = `const session = await auth();`;
      welcomeMessage = `Welcome to Toolpad, {session?.user?.name || 'User'}!`;
    } else {
      imports += `\nimport { useSession } from 'next-auth/react';`;
      sessionHandling = `const { data: session } = useSession();`;
      welcomeMessage = `Welcome to Toolpad, {session?.user?.name || 'User'}!`;
    }
  } else {
    imports += `\nimport Link from 'next/link';`;
    welcomeMessage = `Welcome to <Link href="https://mui.com/toolpad/core/introduction">Toolpad Core!</Link>`;
  }

  const isAsync = authEnabled && routerType === 'nextjs-app' ? 'async ' : '';

  let requireAuth = '';
  if (authEnabled && routerType === 'nextjs-pages') {
    requireAuth = `\n\nHomePage.requireAuth = true;`;
  }

  return `${imports}

export default ${isAsync}function HomePage() {
  ${sessionHandling}

  return (    
      <Typography>
        ${welcomeMessage}
      </Typography>
  );
}${requireAuth}
`;
};

export default indexPage;
