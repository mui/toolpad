import type { NextPage } from 'next';
import * as React from 'react';
import { Button, Container, List, ListItem, Typography } from '@mui/material';
import client from '../src/api';
import * as studioDom from '../src/studioDom';

const Home: NextPage = () => {
  const domQuery = client.useQuery('loadDom', []);

  const app = domQuery.data && studioDom.getApp(domQuery.data);
  const { pages = [] } = app ? studioDom.getChildNodes(domQuery.data, app) : {};

  return (
    <React.Fragment>
      <Container>
        <Typography variant="h4">Pages</Typography>
        <List>
          {pages.map((page) => (
            <ListItem key={page.id} button component="a" href={`/api/deploy/${page.id}`}>
              {page.attributes.title.value}
            </ListItem>
          ))}
        </List>
        <Button component="a" href="/_studio/editor">
          Editor
        </Button>
      </Container>
    </React.Fragment>
  );
};

export default Home;
