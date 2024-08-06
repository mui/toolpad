import * as React from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import SectionHeadline from 'docs/src/components/typography/SectionHeadline';
import Section from 'docs/src/layouts/Section';
import IconImage from 'docs/src/components/icon/IconImage';
import Banner from './Banner';
import ROUTES from '../../route';

const cardRootStyle = (imageUrl) => ({
  px: imageUrl ? 0 : 2,
  pt: imageUrl ? 0 : 2,
  pb: 2,
  height: '100%',
});

const cardMediaStyle = (imageUrl) => ({
  display: 'block',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  objectFit: 'contain',
  background: `#001E3C url(${imageUrl})`,
  backgroundSize: 'contain',
  borderTopLeftRadius: '10px',
  borderTopRightRadius: '10px',
  borderWidth: '0px',
  // https://stackoverflow.com/questions/600743/how-to-get-div-height-to-auto-adjust-to-background-size
  paddingTop: '55.55%',
});

const cardContentRootStyle = (imageUrl) => ({
  p: imageUrl ? 2 : 0,
});

export default function CardGrid(props) {
  const { content, darker } = props;
  return (
    <Box
      sx={
        darker
          ? [
              {
                background: (theme) =>
                  `linear-gradient(180deg, ${theme.palette.grey[50]} 0%, ${alpha(
                    theme.palette.grey[100],
                    0.4,
                  )} 100%)`,
              },
              (theme) =>
                theme.applyDarkStyles({
                  background: `radial-gradient(200% 150% at 50% 20%, transparent 30%, ${theme.palette.primaryDark[300]} 100%, ${theme.palette.primaryDark[100]} 0)`,
                }),
            ]
          : null
      }
    >
      <Section>
        <SectionHeadline overline={content.overline} title={content.Headline} />
        <Grid container spacing={2} columns={{ xs: 1, sm: 3 }}>
          {content.cards.map(({ icon, title, wip, imageUrl, description }) => (
            <Grid key={title} size={{ xs: 2, sm: 1 }}>
              <Paper variant="outlined" sx={cardRootStyle(imageUrl)}>
                {imageUrl && <Box sx={cardMediaStyle(imageUrl)} />}
                <Box sx={cardContentRootStyle(imageUrl)}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {icon ?? null}
                      <Typography
                        fontWeight="bold"
                        component="h3"
                        color="text.primary"
                        variant="body2"
                        sx={{ ml: imageUrl ? 0 : 0.8 }}
                      >
                        {title}
                      </Typography>
                    </Box>
                    {wip && <IconImage name="pricing/time" title="Work in progress" />}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Banner
          category="toolpad_to_github"
          action="upvote_click"
          label="Upvote"
          title="Upvote the features you want to get prioritized 👍"
          description="Want to request a feature? Head over to our repo and if not already listed, feel free to open an issue explaining the use case."
          href={ROUTES.toolpadUpvote}
        />
      </Section>
    </Box>
  );
}

CardGrid.propTypes = {
  content: PropTypes.shape({
    cards: PropTypes.arrayOf(
      PropTypes.shape({
        description: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
        icon: PropTypes.node,
        imageUrl: PropTypes.string,
        title: PropTypes.string.isRequired,
        wip: PropTypes.bool,
      }),
    ),
    Headline: PropTypes.node.isRequired,
    overline: PropTypes.string.isRequired,
  }).isRequired,
  darker: PropTypes.bool,
};
