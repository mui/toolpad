import * as React from 'react';
import { Box, Card, CardActionArea, CardContent, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import * as appDom from '../appDom';

interface PageCardProps {
  page: appDom.PageNode;
}

function PageCard({ page }: PageCardProps) {
  return (
    <Card sx={{ gridColumn: 'span 1' }}>
      <CardActionArea component={Link} to={`/pages/${page.id}`}>
        <CardContent>
          <Typography gutterBottom variant="h5">
            {page.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {page.attributes.title.value}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

interface AppOverviewProps {
  dom: appDom.AppDom;
}

export default function AppOverview({ dom }: AppOverviewProps) {
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
          <PageCard key={page.id} page={page} />
        ))}
      </Box>
    </Container>
  );
}
