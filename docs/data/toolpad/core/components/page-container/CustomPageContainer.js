import * as React from 'react';
import PropTypes from 'prop-types';
import { PageContainer } from '@toolpad/core/PageContainer';
import { AppProvider } from '@toolpad/core/AppProvider';
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

function Content({ router }) {
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

Content.propTypes = {
  router: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    pathname: PropTypes.string.isRequired,
    searchParams: PropTypes.shape({
      '__@iterator@334': PropTypes.func.isRequired,
      append: PropTypes.func.isRequired,
      delete: PropTypes.func.isRequired,
      entries: PropTypes.func.isRequired,
      forEach: PropTypes.func.isRequired,
      get: PropTypes.func.isRequired,
      getAll: PropTypes.func.isRequired,
      has: PropTypes.func.isRequired,
      keys: PropTypes.func.isRequired,
      set: PropTypes.func.isRequired,
      size: PropTypes.number.isRequired,
      sort: PropTypes.func.isRequired,
      toString: PropTypes.func.isRequired,
      values: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
};

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
