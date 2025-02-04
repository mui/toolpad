import * as React from 'react';
import { useTranslate } from '@mui/docs/i18n';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import SvgIcon from '@mui/material/SvgIcon';
import Visibility from '@mui/icons-material/Visibility';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { useTheme } from '@mui/material/styles';
import { sxChip } from 'docs/src/modules/components/AppNavDrawerItem';
import { Example, versionGitHubLink } from './examplesUtils';

interface FeaturedExamplesProps {
  examples: Example[];
}

export default function ExamplesFeatured(props: FeaturedExamplesProps) {
  const t = useTranslate();

  const examples = props.examples.filter((example: Example) => example.featured === true);
  const docsTheme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mb: 4 }}>
      {examples.map((example: Example) => {
        const computedSrc =
          docsTheme?.palette?.mode === 'dark' && example.srcDark ? example.srcDark : example.src;
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }} key={example.title}>
            <Typography component="h3" variant="h6" sx={{ fontWeight: 'semiBold' }}>
              {example.title}
              {example.new && <Chip label="NEW" sx={sxChip('success')} />}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              {example.description}
            </Typography>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderColor: 'divider',
              }}
            >
              <Link
                href={example.href}
                target="_blank"
                sx={{
                  position: 'relative',
                  '&:hover > .MuiCardMedia-root': {
                    filter: 'blur(4px)',
                  },
                  '&:hover > .MuiButtonBase-root': {
                    opacity: 1,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={computedSrc}
                  title={example.title}
                  sx={{
                    aspectRatio: '16 / 9',
                    objectPosition: 'top',
                    transition: 'filter 0.3s',
                  }}
                />
                <Button
                  variant="text"
                  endIcon={<OpenInNewRoundedIcon />}
                  data-ga-event-category="toolpad-core-template"
                  data-ga-event-label={example.title}
                  data-ga-event-action="preview-img"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0,
                    transition: 'opacity 0.5s ease',
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      backgroundColor: 'background.default',
                    },
                  }}
                >
                  {t('seeLivePreview')}
                </Button>
              </Link>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  p: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {example.stackBlitz === true ? (
                    <Tooltip title="Edit in StackBlitz">
                      <IconButton
                        component="a"
                        href={`https://stackblitz.com/github/${example.source.replace('https://github.com/', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="primary"
                        size="small"
                        aria-label={t('stackblitzPlayground')}
                        data-ga-event-category="toolpad-core-template"
                        data-ga-event-action="stackblitz"
                      >
                        <SvgIcon viewBox="0 0 19 28">
                          <path d="M8.13378 16.1087H0L14.8696 0L10.8662 11.1522L19 11.1522L4.13043 27.2609L8.13378 16.1087Z" />
                        </SvgIcon>
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
                        color="primary"
                        size="small"
                        aria-label={t('codesandboxPlayground')}
                        data-ga-event-category="toolpad-core-template"
                        data-ga-event-action="codesandbox"
                      >
                        <SvgIcon viewBox="0 0 1080 1080">
                          <path d="M755 140.3l0.5-0.3h0.3L512 0 268.3 140h-0.3l0.8 0.4L68.6 256v512L512 1024l443.4-256V256L755 140.3z m-30 506.4v171.2L548 920.1V534.7L883.4 341v215.7l-158.4 90z m-584.4-90.6V340.8L476 534.4v385.7L300 818.5V646.7l-159.4-90.6zM511.7 280l171.1-98.3 166.3 96-336.9 194.5-337-194.6 165.7-95.7L511.7 280z" />
                        </SvgIcon>
                      </IconButton>
                    </Tooltip>
                  ) : null}
                  <Tooltip title="See source code">
                    <IconButton
                      component="a"
                      href={versionGitHubLink(example.source)}
                      color="primary"
                      size="small"
                    >
                      <CodeRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Button
                  component="a"
                  href={example.href}
                  size="small"
                  variant="outlined"
                  color="primary"
                  startIcon={<Visibility sx={{ mr: 0.5 }} />}
                  data-ga-event-category="toolpad-core-template"
                  data-ga-event-label={example.title}
                  data-ga-event-action="preview-img"
                  sx={{ alignSelf: 'self-start' }}
                >
                  {t('livePreview')}
                </Button>
              </Box>
            </Card>
          </Box>
        );
      })}
    </Box>
  );
}
