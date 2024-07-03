import * as React from 'react';
import { PageContent } from '@toolpad/core/PageContent';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useDemoRouter } from '@toolpad/core/internals/demo';
import { Link } from '@mui/material';

const NAVIGATION = [
  { slug: '', title: 'Home' },
  { slug: 'orders', title: 'Orders' },
];

function Content({ router }) {
  switch (router.pathname) {
    case '/':
      return (
        <React.Fragment>
          The home page.{' '}
          {router.pathname === '/' ? (
            <Link
              href="/orders"
              onClick={(event) => {
                event.preventDefault();
                router.navigate('/orders');
              }}
            >
              Go to orders
            </Link>
          ) : null}
          .
        </React.Fragment>
      );

    case '/orders':
      return 'The orders page';
    default:
      return 'Not found';
  }
}

export default function BasicPageContent() {
  const router = useDemoRouter('/orders');

  return (
    <AppProvider navigation={NAVIGATION} router={router}>
      <PageContent>
        <Content router={router} />
      </PageContent>
    </AppProvider>
  );
}
