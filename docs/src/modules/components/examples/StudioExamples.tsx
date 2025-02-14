import * as React from 'react';
import ExamplesGrid from 'docs-toolpad/src/modules/components/examples/ExamplesGrid';
import type { Example } from './examplesUtils';

const examples = [
  {
    title: 'npm stats',
    description:
      'This analytics dashboard shows how to track a KPI from a third-party data source.',
    src: '/static/toolpad/docs/studio/examples/npm-stats.png',
    srcDark: '/static/toolpad/docs/studio/examples/npm-stats.png', // TODO fix
    href: 'https://mui.com/toolpad/studio/examples/npm-stats/',
    source: 'https://github.com/mui/toolpad/tree/master/examples/studio/npm-stats/',
  },
  {
    title: 'Basic CRUD application',
    description: 'An admin application to showcase how CRUD operations work in Toolpad Studio.',
    src: '/static/toolpad/docs/studio/examples/basic-crud-app.png',
    srcDark: '/static/toolpad/docs/studio/examples/basic-crud-app.png', // TODO fix
    href: 'https://mui.com/toolpad/studio/examples/basic-crud-app/',
    source: 'https://github.com/mui/toolpad/tree/master/examples/studio/basic-crud-app/',
  },
  {
    title: 'QR Code generator',
    description:
      'A basic Toolpad Studio application that can be used to turn any text or URL into a QR code.',
    src: '/static/toolpad/docs/studio/examples/qr-generator.png',
    srcDark: '/static/toolpad/docs/studio/examples/qr-generator.png', // TODO fix
    href: 'https://mui.com/toolpad/studio/examples/qr-generator/',
    source: 'https://github.com/mui/toolpad/tree/master/examples/studio/qr-generator/',
  },
  {
    title: 'With Prisma',
    description:
      'A basic Toolpad Studio application that demonstrates how to integrate with Prisma.',
    src: '/static/toolpad/marketing/with-prisma-hero.png',
    srcDark: '/static/toolpad/marketing/with-prisma-hero.png', // TODO fix
    href: 'https://github.com/mui/toolpad/tree/master/examples/studio/with-prisma/',
    source: 'https://github.com/mui/toolpad/tree/master/examples/studio/with-prisma/',
  },
  {
    title: 'Google Sheet',
    description: 'Quickly fetch data from Google Sheets to build a Toolpad Studio app.',
    src: '/static/toolpad/marketing/google-sheet.png',
    srcDark: '/static/toolpad/marketing/google-sheet.png', // TODO fix
    href: 'https://github.com/mui/toolpad/tree/master/examples/studio/google-sheet/',
    source: 'https://github.com/mui/toolpad/tree/master/examples/studio/google-sheet/',
  },
  {
    title: 'Dog app',
    description: 'An app that shows dog images based on selected breeds or sub-breeds.',
    src: '/static/toolpad/docs/studio/getting-started/first-app/step-13.png',
    srcDark: '/static/toolpad/docs/studio/getting-started/first-app/step-13.png', // TODO fix
    href: 'https://github.com/mui/toolpad/tree/master/examples/studio/dog-app/',
    source: 'https://github.com/mui/toolpad/tree/master/examples/studio/dog-app/',
  },
  {
    title: 'Customized data grid',
    description:
      'A basic Toolpad Studio app that shows how to customize a data grid column using a custom code component.',
    src: '/static/toolpad/marketing/custom-datagrid-column.png',
    srcDark: '/static/toolpad/marketing/custom-datagrid-column.png', // TODO fix
    href: 'https://github.com/mui/toolpad/tree/master/examples/studio/custom-datagrid-column',
    source: 'https://github.com/mui/toolpad/tree/master/examples/studio/custom-datagrid-column/',
  },
  {
    title: 'GraphQL app',
    description: 'An app that shows latest 100 stargazers info for any GitHub repository.',
    src: '/static/toolpad/marketing/graphql.png',
    srcDark: '/static/toolpad/marketing/graphql.png', // TODO fix
    href: 'https://github.com/mui/toolpad/tree/master/examples/studio/graphql/',
    source: 'https://github.com/mui/toolpad/tree/master/examples/studio/graphql/',
  },
  {
    title: 'With WASM',
    description:
      'A basic Toolpad Studio application that demonstrates integrating with WASM modules.',
    src: '/static/toolpad/marketing/with-wasm.png',
    srcDark: '/static/toolpad/marketing/with-wasm.png', // TODO fix
    href: 'https://github.com/mui/toolpad/tree/master/examples/studio/with-wasm/',
    source: 'https://github.com/mui/toolpad/tree/master/examples/studio/with-wasm/',
  },
  {
    title: 'Data provider with prisma',
    description:
      'A basic Toolpad Studio application that demonstrates how to use data providers with Prisma.',
    src: '/static/toolpad/marketing/with-prisma-data-provider.png',
    srcDark: '/static/toolpad/marketing/with-prisma-data-provider.png', // TODO fix
    href: 'https://github.com/mui/toolpad/tree/master/examples/studio/with-prisma-data-provider/',
    source: 'https://github.com/mui/toolpad/tree/master/examples/studio/with-prisma-data-provider/',
  },
  {
    title: 'With Supabase',
    description:
      'A Toolpad Studio app that fetches data from Supabase and shows it in a list component.',
    src: '/static/toolpad/marketing/supabase.png',
    srcDark: '/static/toolpad/marketing/supabase.png', // TODO fix
    href: 'https://github.com/mui/toolpad/tree/master/examples/studio/supabase/',
    source: 'https://github.com/mui/toolpad/tree/master/examples/studio/supabase/',
  },
  {
    title: 'Stripe invoice downloader',
    description: 'A Stripe app to fetch and download invoices.',
    src: '/static/toolpad/marketing/stripe-script.png',
    srcDark: '/static/toolpad/marketing/stripe-script.png', // TODO fix
    href: 'https://github.com/mui/toolpad/tree/master/examples/studio/stripe-script/',
    source: 'https://github.com/mui/toolpad/tree/master/examples/studio/stripe-script/',
  },
  {
    title: 'Charts',
    description: 'A basic Toolpad Studio application that demonstrates how to use chart component.',
    src: '/static/toolpad/marketing/charts.png',
    srcDark: '/static/toolpad/marketing/charts.png', // TODO fix
    href: 'https://github.com/mui/toolpad/tree/master/examples/studio/charts/',
    source: 'https://github.com/mui/toolpad/tree/master/examples/studio/charts/',
  },
  {
    title: 'Google Authentication',
    description: 'An app that shows how to set up Google authentication in Toolpad Studio.',
    src: '/static/toolpad/marketing/auth-google.png',
    srcDark: '/static/toolpad/marketing/auth-google.png', // TODO fix
    href: 'https://github.com/mui/toolpad/tree/master/examples/studio/auth-google/',
    source: 'https://github.com/mui/toolpad/tree/master/examples/studio/auth-google/',
  },
  {
    title: 'Custom server',
    description: 'An app that shows how to use Toolpad Studio with a custom server.',
    src: '/static/toolpad/marketing/custom-server.png',
    srcDark: '/static/toolpad/marketing/custom-server.png', // TODO fix
    href: 'https://github.com/mui/toolpad/tree/master/examples/studio/custom-server/',
    source: 'https://github.com/mui/toolpad/tree/master/examples/studio/custom-server/',
  },
] satisfies Example[];

export default function StudioExamples() {
  return <ExamplesGrid examples={examples} />;
}
