import * as React from 'react';
import { useTranslate } from '@mui/docs/i18n';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import { Example, versionGitHubLink } from './examplesUtils';

interface ExamplesGridProps {
  examples: Example[];
}

function StackBlitzIcon() {
  return (
    <SvgIcon viewBox="0 0 19 28">
      <path d="M8.13378 16.1087H0L14.8696 0L10.8662 11.1522L19 11.1522L4.13043 27.2609L8.13378 16.1087Z" />
    </SvgIcon>
  );
}

function CodeSandboxIcon() {
  return (
    <SvgIcon viewBox="0 0 1024 1024">
      <path d="M755 140.3l0.5-0.3h0.3L512 0 268.3 140h-0.3l0.8 0.4L68.6 256v512L512 1024l443.4-256V256L755 140.3z m-30 506.4v171.2L548 920.1V534.7L883.4 341v215.7l-158.4 90z m-584.4-90.6V340.8L476 534.4v385.7L300 818.5V646.7l-159.4-90.6zM511.7 280l171.1-98.3 166.3 96-336.9 194.5-337-194.6 165.7-95.7L511.7 280z" />
    </SvgIcon>
  );
}

export default function ExamplesGrid(props: ExamplesGridProps) {
  const t = useTranslate();

  const examples = props.examples.filter((example: Example) => example.featured !== true);
  const docsTheme = useTheme();

  return (
    <Grid container spacing={2} sx={{ pt: 2, pb: 4 }}>
      {examples.map((example) => {
        const computedSrc =
          docsTheme?.palette?.mode === 'dark' && example.srcDark ? example.srcDark : example.src;
        return (
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
                image={computedSrc}
                title={example.description}
                href={example.href || versionGitHubLink(example.source)}
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
              <CardActions
                sx={{
                  p: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Button
                  component="a"
                  href={versionGitHubLink(example.source)}
                  size="small"
                  target="_blank"
                >
                  {t('source')}
                </Button>
                <Stack direction="row" spacing={1}>
                  {example.stackBlitz === true ? (
                    <Tooltip title="Edit in StackBlitz">
                      <IconButton
                        component="a"
                        href={`https://stackblitz.com/github/${example.source.replace('https://github.com/', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                      >
                        <StackBlitzIcon />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                  {example.codeSandbox === true ? (
                    <Tooltip title="Edit in CodeSandbox">
                      <IconButton
                        component="a"
                        href={`https://codesandbox.io/p/sandbox/github/${example.source.replace('https://github.com/', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                      >
                        <CodeSandboxIcon />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                </Stack>
              </CardActions>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
