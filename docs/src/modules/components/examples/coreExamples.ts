import type { Example } from './examplesUtils';

const coreExamples = [
  {
    title: 'Functional dashboard',
    description:
      'This example shows you how to get started building a dashboard with Toolpad Core, Next.js App Router, Auth.js and Material UI components in a customized theme.',
    src: '/static/toolpad/docs/core/functional-dashboard.png',
    href: 'https://mui.com/toolpad/core/templates/nextjs-dashboard/',
    srcDark: '/static/toolpad/docs/core/functional-dashboard-dark.png',
    source: 'https://github.com/mui/toolpad/tree/master/examples/core/auth-nextjs-themed',
    featured: true,
    new: true,
    codeSandbox: true,
    stackBlitz: true,
  },
  {
    title: 'Vite with React Router and Firebase Auth',
    description:
      'This app shows you to how to get started using Toolpad Core with Vite, React Router, and authentication using Firebase.',
    src: '/static/toolpad/docs/core/firebase-vite-light.png',
    srcDark: '/static/toolpad/docs/core/firebase-vite-dark.png',
    source: 'https://github.com/mui/toolpad/tree/master/examples/core/firebase-vite',
    // Show nothing
    codeSandbox: false,
    stackBlitz: false,
  },
  {
    title: 'Vite with React Router and mock authentication',
    description:
      'This app shows you to how to get started using Toolpad Core with Vite, React Router and any external authentication provider.',
    src: '/static/toolpad/docs/core/vite-react-router.png',
    srcDark: '/static/toolpad/docs/core/vite-react-router.png', // TODO Fix
    source: 'https://github.com/mui/toolpad/tree/master/examples/core/auth-vite',
    codeSandbox: true,
    // Show nothing
    stackBlitz: false,
  },
  {
    title: 'Next.js App Router with Auth.js Passkey',
    description:
      'This app shows you to how to get started using Toolpad Core with Auth.js Passkeys and the Next.js App Router.',
    src: '/static/toolpad/docs/core/auth-next-passkey.png',
    srcDark: '/static/toolpad/docs/core/auth-next-passkey-dark.png',
    source: 'https://github.com/mui/toolpad/tree/master/examples/core/auth-nextjs-passkey',
    // Crash with Prisma
    codeSandbox: false,
    stackBlitz: false,
  },
  {
    title: 'Auth.js v4 with Next.js Pages Router',
    description:
      'This app shows you to how to get started using Toolpad Core with Auth.js v4 and the Next.js Pages router.',
    src: '/static/toolpad/docs/core/auth-next.png',
    srcDark: '/static/toolpad/docs/core/auth-next-dark.png',
    source: 'https://github.com/mui/toolpad/tree/master/examples/core/auth-nextjs-pages-nextauth-4',
    codeSandbox: true,
    // Show nothing
    stackBlitz: false,
  },
  {
    title: 'Vite with React Router',
    description:
      'This app shows you to how to get started using Toolpad Core with Vite and React Router.',
    src: '/static/toolpad/docs/core/vite-react-router.png',
    srcDark: '/static/toolpad/docs/core/vite-react-router.png', // TODO Fix
    source: 'https://github.com/mui/toolpad/tree/master/examples/core/vite',
    codeSandbox: true,
    // Show nothing
    stackBlitz: false,
  },
  {
    title: 'Auth.js Magic Link with Next.js App Router',
    description:
      'This app shows you to how to get started using Toolpad Core with Auth.js Magic Links and the Next.js App Router.',
    src: '/static/toolpad/docs/core/auth-next.png',
    srcDark: '/static/toolpad/docs/core/auth-next.png', // TODO Fix
    source: 'https://github.com/mui/toolpad/tree/master/examples/core/auth-nextjs-email',
    // Crash with Prisma
    codeSandbox: false,
    stackBlitz: false,
  },
  {
    title: 'Auth.js with Next.js Pages Router',
    description:
      'This app shows you to how to get started using Toolpad Core with Auth.js and the Next.js Pages router.',
    src: '/static/toolpad/docs/core/auth-next.png',
    srcDark: '/static/toolpad/docs/core/auth-next-dark.png',
    source: 'https://github.com/mui/toolpad/tree/master/examples/core/auth-nextjs-pages',
    // infinite redirection
    codeSandbox: false,
    stackBlitz: false,
  },
  {
    title: 'Auth.js with Next.js App Router',
    description:
      'This app shows you to how to get started using Toolpad Core with Auth.js and the Next.js App Router.',
    src: '/static/toolpad/docs/core/auth-next.png',
    srcDark: '/static/toolpad/docs/core/auth-next-dark.png',
    source: 'https://github.com/mui/toolpad/tree/master/examples/core/auth-nextjs',
    codeSandbox: true,
    stackBlitz: true,
  },
  {
    title: 'Tutorial app',
    description:
      'This app shows you to get started with Toolpad Core and use basic layout and navigation features.',
    src: '/static/toolpad/docs/core/tutorial-1.png',
    srcDark: '/static/toolpad/docs/core/tutorial-1.png', // TODO Fix
    href: 'https://mui.com/toolpad/core/introduction/tutorial/',
    source: 'https://github.com/mui/toolpad/tree/master/examples/core/tutorial',
    codeSandbox: true,
    stackBlitz: true,
  },
] satisfies Example[];

export default coreExamples;
