import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import SectionHeadline from 'docs/src/components/typography/SectionHeadline';
import IconImage from 'docs/src/components/icon/IconImage';

const cardRootStyle = (imageUrl) => ({
  px: imageUrl ? 0 : 2,
  pb: 3,
  pt: imageUrl ? 0 : 3,
  height: '100%',
  maxWidth: 360,
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
          ? {
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? `linear-gradient(180deg, ${theme.palette.primaryDark[900]} 0%, transparent 100%)`
                  : `linear-gradient(180deg, ${theme.palette.grey[50]} 0%, transparent 100%)`,
            }
          : null
      }
    >
      <Container sx={{ py: { xs: 4, sm: 6 } }}>
        <SectionHeadline overline={content.overline} title={content.Headline} />
        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
          {content.cards.map(({ icon, title, wip, imageUrl, description }) => (
            <Grid key={title}>
              <Paper variant="outlined" sx={cardRootStyle(imageUrl)}>
                {imageUrl ? <Box sx={cardMediaStyle(imageUrl)} /> : null}
                <Box sx={cardContentRootStyle(imageUrl)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {icon ?? null}
                    <Typography
                      fontWeight="bold"
                      component="h3"
                      color="text.primary"
                      variant="body2"
                      sx={{ ml: imageUrl ? 0 : 1 }}
                    >
                      {title}
                    </Typography>
                    {wip ? (
                      <IconImage name="time" title="Work in progress" sx={{ ml: 'auto', mr: 2 }} />
                    ) : null}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
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
