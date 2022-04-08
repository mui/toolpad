import * as React from 'react';
import { Box, Button, Card, CardActions, CardContent, Container, Typography } from '@mui/material';
import * as appDom from '../appDom';

interface PageCardProps {
  appId: string;
  page: appDom.PageNode;
}

function PageCard({ appId, page }: PageCardProps) {
  return (
    <Card sx={{ gridColumn: 'span 1' }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {page.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {page.attributes.title.value}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" component="a" href={`/deploy/${appId}/${page.id}`}>
          open
        </Button>
      </CardActions>
    </Card>
  );
}

interface AppOverviewProps {
  appId: string;
  dom: appDom.AppDom;
}

export default function AppOverview({ appId, dom }: AppOverviewProps) {
  const app = dom ? appDom.getApp(dom) : null;
  const { pages = [] } = dom && app ? appDom.getChildNodes(dom, app) : {};
  return (
    <Container>
      <Typography variant="h2">Pages</Typography>
      <Box
        sx={{
          my: 5,
          display: 'grid',
          gridTemplateColumns: {
            lg: 'repeat(4, 1fr)',
            md: 'repeat(3, 1fr)',
            sm: 'repeat(2, fr)',
            xs: 'repeat(1, fr)',
          },
          gap: 2,
        }}
      >
        {pages.map((page) => (
          <PageCard key={page.id} appId={appId} page={page} />
        ))}
      </Box>
    </Container>
  );
}
