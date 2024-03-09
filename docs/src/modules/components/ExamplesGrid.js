import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

function layouts() {
  return [
    {
      title: 'npm stats',
      description:
        'This analytics dashboard shows how to track a KPI from a third-party data source.',
      src: '/static/toolpad/docs/studio/examples/npm-stats.png',
      href: 'https://mui.com/toolpad/studio/examples/npm-stats/',
      source: 'https://github.com/mui/mui-toolpad/tree/master/examples/npm-stats',
    },
    {
      title: 'Basic CRUD application',
      description: 'An admin application to showcase how CRUD operations work in Toolpad Studio.',
      src: '/static/toolpad/docs/studio/examples/basic-crud-app.png',
      href: 'https://mui.com/toolpad/studio/examples/basic-crud-app/',
      source: 'https://github.com/mui/mui-toolpad/tree/master/examples/basic-crud-app',
    },
    {
      title: 'QR Code generator',
      description:
        'A basic Toolpad Studio application that can be used to turn any text or URL into a QR code.',
      src: '/static/toolpad/docs/studio/examples/qr-generator.png',
      href: 'https://mui.com/toolpad/studio/examples/qr-generator/',
      source: 'https://github.com/mui/mui-toolpad/tree/master/examples/qr-generator',
    },
    {
      title: 'With Prisma',
      description:
        'A basic Toolpad Studio application that demonstrates how to integrate with Prisma.',
      src: '/static/toolpad/marketing/with-prisma-hero.png',
      href: 'https://github.com/mui/mui-toolpad/tree/master/examples/with-prisma',
      source: 'https://github.com/mui/mui-toolpad/tree/master/examples/with-prisma',
    },
    {
      title: 'Google Sheet',
      description: 'Quickly fetch data from Google Sheets to build a Toolpad Studio app.',
      src: '/static/toolpad/marketing/google-sheet.png',
      href: 'https://github.com/mui/mui-toolpad/tree/master/examples/google-sheet',
      source: 'https://github.com/mui/mui-toolpad/tree/master/examples/google-sheet',
    },
    {
      title: 'Dog app',
      description: 'An app that shows dog images based on selected breeds or sub-breeds.',
      src: '/static/toolpad/docs/studio/getting-started/first-app/step-13.png',
      href: 'https://github.com/mui/mui-toolpad/tree/master/examples/dog-app',
      source: 'https://github.com/mui/mui-toolpad/tree/master/examples/dog-app',
    },
    {
      title: 'Customized data grid',
      description:
        'A basic Toolpad Studio app that shows how to customize a data grid column using a custom code component.',
      src: '/static/toolpad/marketing/custom-datagrid-column.png',
      href: 'https://github.com/mui/mui-toolpad/tree/master/examples/custom-datagrid-column',
      source: 'https://github.com/mui/mui-toolpad/tree/master/examples/custom-datagrid-column',
    },
    {
      title: 'GraphQL app',
      description: 'An app that shows latest 100 stargazers info for any GitHub repository.',
      src: '/static/toolpad/marketing/graphql.png',
      href: 'https://github.com/mui/mui-toolpad/tree/master/examples/graphql',
      source: 'https://github.com/mui/mui-toolpad/tree/master/examples/graphql',
    },
    {
      title: 'With WASM',
      description:
        'A basic Toolpad Studio application that demonstrates integrating with WASM modules.',
      src: '/static/toolpad/marketing/with-wasm.png',
      href: 'https://github.com/mui/mui-toolpad/tree/master/examples/with-wasm',
      source: 'https://github.com/mui/mui-toolpad/tree/master/examples/with-wasm',
    },
    {
      title: 'Data provider with prisma',
      description:
        'A basic Toolpad Studio application that demonstrates how to use data providers with Prisma.',
      src: '/static/toolpad/marketing/with-prisma-data-provider.png',
      href: 'https://github.com/mui/mui-toolpad/tree/master/examples/with-prisma-data-provider',
      source: 'https://github.com/mui/mui-toolpad/tree/master/examples/with-prisma-data-provider',
    },
    {
      title: 'With Supabase',
      description:
        'A Toolpad Studio app that fetches data from Supabase and shows it in a list component.',
      src: '/static/toolpad/marketing/supabase.png',
      href: 'https://github.com/mui/mui-toolpad/tree/master/examples/supabase',
      source: 'https://github.com/mui/mui-toolpad/tree/master/examples/supabase',
    },
    {
      title: 'Stripe invoice downloader',
      description: 'A Stripe app to fetch and download invoices.',
      src: '/static/toolpad/marketing/stripe-script.png',
      href: 'https://github.com/mui/mui-toolpad/tree/master/examples/stripe-script',
      source: 'https://github.com/mui/mui-toolpad/tree/master/examples/stripe-script',
    },
    {
      title: 'Charts',
      description:
        'A basic Toolpad Studio application that demonstrates how to use chart component.',
      src: '/static/toolpad/marketing/charts.png',
      href: 'https://github.com/mui/mui-toolpad/tree/master/examples/charts',
      source: 'https://github.com/mui/mui-toolpad/tree/master/examples/charts',
    },
    {
      title: 'Google Authentication',
      description: 'An app that shows how to set up Google authentication in Toolpad Studio.',
      src: '/static/toolpad/marketing/auth-google.png',
      href: 'https://github.com/mui/mui-toolpad/tree/master/examples/auth-google',
      source: 'https://github.com/mui/mui-toolpad/tree/master/examples/auth-google',
    },
    {
      title: 'Custom server',
      description: 'An app that shows how to use Toolpad Studio with a custom server.',
      src: '/static/toolpad/marketing/custom-server.png',
      href: 'https://github.com/mui/mui-toolpad/tree/master/examples/custom-server',
      source: 'https://github.com/mui/mui-toolpad/tree/master/examples/custom-server',
    },
  ];
}

function Templates() {
  return (
    <Grid container spacing={2} sx={{ pt: 2, pb: 4 }}>
      {layouts().map((layout) => (
        <Grid item xs={12} sm={4} sx={{ flexGrow: 1 }} key={layout.title}>
          <Card
            sx={(theme) => ({
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              px: 2,
              pt: 2,
              pb: 1,
              gap: 1.5,
              borderRadius: 1,
              backgroundColor: `${alpha(theme.palette.grey[50], 0.4)}`,
              borderColor: 'divider',
              ...theme.applyDarkStyles({
                backgroundColor: `${alpha(theme.palette.primaryDark[700], 0.3)}`,
                borderColor: 'divider',
              }),
            })}
            variant="outlined"
          >
            <CardMedia
              component="a"
              image={layout.src}
              title={layout.description}
              href={layout.href}
              rel="nofollow"
              sx={(theme) => ({
                height: 0,
                pt: '65%',
                borderRadius: 0.5,
                bgcolor: 'currentColor',
                border: '1px solid',
                borderColor: 'grey.100',
                color: 'grey.100',
                ...theme.applyDarkStyles({
                  borderColor: 'grey.900',
                  color: 'primaryDark.900',
                }),
              })}
            />
            <CardContent sx={{ flexGrow: 1, p: 0 }}>
              <Typography component="h2" variant="h6" fontWeight={600} gutterBottom>
                {layout.title}
              </Typography>
              <Typography component="p" variant="body2" color="text.secondary">
                {layout.description}
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 0, ml: -1 }}>
              <Button component="a" href={layout.source} size="small" target="_blank">
                Source code
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default Templates;
