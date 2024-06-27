import * as React from 'react';
import { PageContent } from '@toolpad/core/PageContent';
import { AppProvider } from '@toolpad/core/AppProvider';

const Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    slug: '',
    title: 'Dashboard',
    icon: 'DashboardIcon',
  },
  {
    slug: 'orders',
    title: 'Orders',
    icon: 'ShoppingCartIcon',
  },
];

export default function BasicPageContent() {
  return (
    <AppProvider>
      <PageContent>The content</PageContent>
    </AppProvider>
  );
}
