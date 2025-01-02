import { Template } from '../types';

const indexPage: Template = (options) => {
  const authEnabled = options.auth;
  const routerType = options.router;

  let imports = `import * as React from 'react';
import Typography from '@mui/material/Typography';`;

  let sessionHandling = '';

  let welcomeMessage = `Welcome to Toolpad Core!`;

  if (options.framework === 'nextjs') {
    if (authEnabled) {
      welcomeMessage = `Welcome to Toolpad, {session?.user?.name || ${options.hasNodemailerProvider || options.hasPasskeyProvider ? `session?.user?.email ||` : ''}'User'}!`;
      if (routerType === 'nextjs-app') {
        if (options.hasNodemailerProvider || options.hasPasskeyProvider) {
          imports += `\nimport { redirect } from 'next/navigation';\nimport { headers } from 'next/headers';`;
        }
        imports += `\nimport { auth } from '../../auth';`;
        sessionHandling = `const session = await auth();`;
        if (options.hasNodemailerProvider || options.hasPasskeyProvider) {
          sessionHandling += `\nconst currentUrl = (await headers()).get('referer') || process.env.AUTH_URL || 'http://localhost:3000';
        if (!session) { // Get the current URL to redirect to signIn with \`callbackUrl\` 
        const redirectUrl = new URL('/auth/signin', currentUrl);\nredirectUrl.searchParams.set('callbackUrl', currentUrl);\nredirect(redirectUrl.toString());
        }
      `;
        }
      } else if (routerType === 'nextjs-pages') {
        imports += `\nimport { useSession } from 'next-auth/react';`;
        sessionHandling = `const { data: session } = useSession();`;
      }
    } else {
      imports += `\nimport Link from 'next/link';`;
      welcomeMessage = `Welcome to <Link href="https://mui.com/toolpad/core/introduction">Toolpad Core!</Link>`;
    }
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
