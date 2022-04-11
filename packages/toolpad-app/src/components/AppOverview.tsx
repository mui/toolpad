import * as React from 'react';
import {
  Box,
  ButtonProps,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Typography,
} from '@mui/material';
import * as appDom from '../appDom';

type OpenPageButtonProps = (
  appId: string,
  page: appDom.PageNode,
) => ButtonProps & { component?: string | React.ComponentType };

interface PageCardProps {
  appId: string;
  page: appDom.PageNode;
  openPageButtonProps?: OpenPageButtonProps;
}

/**
 * Temporary render prop to have dual-mode code-generator/nextjs-page
 * Remove this if/when we fully commit to nextjs rendering of the apps
 */
function defaultOpenPageButtonProps(appId: string, page: appDom.PageNode): ButtonProps {
  return { component: 'a', href: `/deploy/${appId}/${page.id}` } as ButtonProps;
}

function PageCard({
  appId,
  page,
  openPageButtonProps = defaultOpenPageButtonProps,
}: PageCardProps) {
  return (
    <Card sx={{ gridColumn: 'span 1' }}>
      <CardActionArea {...openPageButtonProps(appId, page)}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
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
  appId: string;
  dom: appDom.AppDom;
  openPageButtonProps?: OpenPageButtonProps;
}

export default function AppOverview({ appId, dom, openPageButtonProps }: AppOverviewProps) {
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
          <PageCard
            key={page.id}
            appId={appId}
            page={page}
            openPageButtonProps={openPageButtonProps}
          />
        ))}
      </Box>
    </Container>
  );
}
