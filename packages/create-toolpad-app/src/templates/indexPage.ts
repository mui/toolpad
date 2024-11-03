import { Template } from '../types';

const indexPage: Template = (options) => {
  const authEnabled = options.auth;
  const routerType = options.router;
  const hasNodemailerProvider = options.authProviders?.includes('nodemailer');

  let imports = `import * as React from 'react';
import Typography from '@mui/material/Typography';`;

  let sessionHandling = '';
  let welcomeMessage = `Welcome to <Link href="https://mui.com/toolpad/core/introduction">Toolpad Core!</Link>`;

  if (authEnabled) {
    if (routerType === 'nextjs-app') {
      imports += `\nimport { auth } from '../../auth';`;
      sessionHandling = `const session = await auth();`;
      welcomeMessage = `Welcome to Toolpad, {session?.user?.name || 'User'}!`;
      if (hasNodemailerProvider) {
        imports += `\nimport { redirect } from 'next/navigation';\nimport { headers } from 'next/headers';`;

        sessionHandling += `\nconst currentUrl = headers().get('referer') || 'http://localhost:3000';
  
        if (!session) {
          // Get the current URL to redirect to signIn with \`callbackUrl\`
          const redirectUrl = new URL('/auth/signin', currentUrl);
          redirectUrl.searchParams.set('callbackUrl', currentUrl);
      
          redirect(redirectUrl.toString());
        }
        `;
      }
    } else {
      if (hasNodemailerProvider) {
        imports += `\nimport type { InferGetServerSidePropsType, GetServerSideProps } from "next";\nimport { auth } from "../../auth";`;
        sessionHandling += `export const getServerSideProps: GetServerSideProps = async (context) => {
        const session = await auth(context);
          if (!session) {        
            return {
              redirect: {
                permanent: false,
                destination: "/auth/signin",
              },
            props: {},
            };
          }
          return { props: { session } };
      }`;
      }
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

export default ${isAsync}function HomePage(${
    hasNodemailerProvider
      ? `session,
}: InferGetServerSidePropsType<typeof getServerSideProps>`
      : ''
  }) {
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
