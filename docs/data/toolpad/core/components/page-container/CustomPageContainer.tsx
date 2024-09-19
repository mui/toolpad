import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import { AppProvider, Router } from '@toolpad/core/AppProvider';
import { Link, useDemoRouter } from '@toolpad/core/internals';
import { useActivePage } from '@toolpad/core/useActivePage';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

const NAVIGATION = [
  {
    segment: 'inbox',
    title: 'Orders',
    pattern: '/inbox/:id',
  },
];

interface ContentProps {
  router: Router;
}

function Content({ router }: ContentProps) {
  const id = Number(router.pathname.replace('/inbox/', ''));

  const title = `Item ${id}`;

  const activePage = useActivePage();
  const breadCrumbs = [
    ...(activePage?.breadCrumbs ?? []),
    { title, path: `/inbox/${id}` },
  ];

  return (
    // preview-start
    <PageContainer title={title} breadCrumbs={breadCrumbs}>
      {/* preview-end */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Link href={`/inbox/${id - 1}`}>previous</Link>
        <Link href={`/inbox/${id + 1}`}>next</Link>
      </Box>
    </PageContainer>
  );
}

export default function CustomPageContainer() {
  const router = useDemoRouter('/inbox/123');

  const theme = useTheme();

  let content = (
    <PageContainer>
      <Link href={`/inbox/123`}>Item 123</Link>
    </PageContainer>
  );

  if (router.pathname.startsWith('/inbox/')) {
    content = <Content router={router} />;
  }

  return (
    <AppProvider navigation={NAVIGATION} router={router} theme={theme}>
      <Paper sx={{ width: '100%' }}>{content}</Paper>
    </AppProvider>
  );
}
