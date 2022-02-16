import type { NextPage } from 'next';
import * as React from 'react';
import { Button, Container, List, ListItem, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import StudioAppBar from '../src/components/StudioAppBar';
import { NextLinkComposed } from '../src/components/Link';
import client from '../src/api';
import * as studioDom from '../src/studioDom';

const Home: NextPage = () => {
  const router = useRouter();

  const domQuery = client.useQuery('loadApp', [], {
    enabled: router.isReady,
  });

  const app = domQuery.data && studioDom.getApp(domQuery.data);
  const { pages = [] } = app ? studioDom.getChildNodes(domQuery.data, app) : {};

  return (
    <React.Fragment>
      <StudioAppBar actions={null} />
      <Container>
        <Typography variant="h4">Pages</Typography>
        <List>
          {pages.map((page) => (
            <ListItem key={page.id} button component={NextLinkComposed} to={`/pages/${page.id}`}>
              {page.title}
            </ListItem>
          ))}
        </List>
        <Button component={NextLinkComposed} to="/_studio/editor">
          Editor
        </Button>
      </Container>
    </React.Fragment>
  );
};

export default Home;
