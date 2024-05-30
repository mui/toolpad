import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

interface Example {
  title: string;
  description: string;
  src: string;
  href: string;
  source: string;
}

interface TemplatesProps {
  examplesFile: string;
}

function Templates({ examplesFile }: TemplatesProps) {
  const [examples, setExamples] = React.useState<Example[]>([]);

  React.useEffect(() => {
    const importExamples = async () => {
      const exampleContent = await import(`./${examplesFile}`);
      setExamples(exampleContent.default);
    };
    importExamples();
  }, [examplesFile]);

  return (
    <Grid container spacing={2} sx={{ pt: 2, pb: 4 }}>
      {examples.map((example) => (
        <Grid item xs={12} sm={4} sx={{ flexGrow: 1 }} key={example.title}>
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
              ...theme.applyStyles('dark', {
                backgroundColor: `${alpha(theme.palette.primary.dark, 0.1)}`,
                borderColor: 'divider',
              }),
            })}
            variant="outlined"
          >
            <CardMedia
              component="a"
              image={example.src}
              title={example.description}
              href={example.href}
              rel="nofollow"
              sx={(theme) => ({
                height: 0,
                pt: '65%',
                borderRadius: 0.5,
                bgcolor: 'currentColor',
                border: '1px solid',
                borderColor: 'grey.100',
                color: 'grey.100',
                ...theme.applyStyles('dark', {
                  borderColor: 'grey.900',
                  color: 'primaryDark.900',
                }),
              })}
            />
            <CardContent sx={{ flexGrow: 1, p: 0 }}>
              <Typography component="h2" variant="h6" fontWeight={600} gutterBottom>
                {example.title}
              </Typography>
              <Typography component="p" variant="body2" color="text.secondary">
                {example.description}
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 0, ml: -1 }}>
              <Button component="a" href={example.source} size="small" target="_blank">
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
