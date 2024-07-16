import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import { AppProvider, Router } from '@toolpad/core/AppProvider';
import { useDemoRouter } from '@toolpad/core/internals/demo';
import { Link } from '@mui/material';

const NAVIGATION = [
  { segment: '', title: 'Home' },
  { segment: 'orders', title: 'Orders' },
];

interface ContentProps {
  router: Router;
}

function Content({ router }: ContentProps) {
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

export default function BasicPageContainer() {
  const router = useDemoRouter('/orders');

  return (
    <AppProvider navigation={NAVIGATION} router={router}>
      <PageContainer>
        <Content router={router} />
      </PageContainer>
    </AppProvider>
  );
}
