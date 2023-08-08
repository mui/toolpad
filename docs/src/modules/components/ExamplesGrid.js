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
      title: 'With Prisma',
      description: 'A basic Toolpad application that demonstrates how to integrate with prisma.',
      src: '/static/toolpad/marketing/with-prisma-hero.png',
      source: 'https://github.com/mui/mui-toolpad/tree/master/examples/with-prisma',
    },
    {
      title: 'Google sheet',
      description: 'Quickly fetch data from Google sheets to build a Toolpad app',
      src: '/static/toolpad/marketing/google-sheet.png',
      href: 'https://mui.com/toolpad/how-to-guides/connect-to-googlesheets/',
      source: 'https://github.com/mui/mui-toolpad/tree/master/examples/google-sheet',
    },
    {
      title: 'Dog app',
      description: 'An app that shows dog images based on selected breeds or sub-breeds.',
      src: '/static/toolpad/docs/getting-started/first-app/step-13.png',
      source: 'https://github.com/mui/mui-toolpad/tree/master/examples/dog-app',
    },
    {
      title: 'Data grid columns',
      description: 'A basic Toolpad app that shows how to add a code component inside a Data Grid',
      src: '/static/toolpad/marketing/datagrid-columns.png',
      source: 'https://github.com/mui/mui-toolpad/tree/master/examples/datagrid-columns',
    },
    {
      title: 'Custom data grid',
      description: 'A basic Toolpad app that shows how to add a code component inside a Data Grid',
      src: '/static/toolpad/marketing/custom-datagrid-column.png',
      source: 'https://github.com/mui/mui-toolpad/tree/master/examples/custom-datagrid-column',
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
              title={layout.title}
              href={layout.href}
              rel="nofollow"
              target="_blank"
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
              <Button component="a" href={layout.source} size="small">
                {'sourceCode'}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default Templates;
