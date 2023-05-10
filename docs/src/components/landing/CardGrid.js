import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import SectionHeadline from 'docs/src/components/typography/SectionHeadline';
import IconImage from 'docs/src/components/icon/IconImage';
import { alpha } from '@mui/material/styles';

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
          ? {
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? `radial-gradient(200% 150% at 50% 20%, transparent 30%, ${theme.palette.primaryDark[300]} 100%, ${theme.palette.primaryDark[100]} 0)`
                  : `linear-gradient(180deg, ${theme.palette.grey[50]} 0%, ${alpha(
                      theme.palette.grey[100],
                      0.4,
                    )} 100%)`,
            }
          : null
      }
    >
      <Container sx={{ py: { xs: 4, sm: 8 } }}>
        <SectionHeadline overline={content.overline} title={content.Headline} />
        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} columns={{ xs: 1, sm: 2 }}>
          {content.cards.map(({ icon, title, wip, imageUrl, description }) => (
            <Grid key={title} xs={2} sm={1}>
              <Paper variant="outlined" sx={cardRootStyle(imageUrl)}>
                {imageUrl ? <Box sx={cardMediaStyle(imageUrl)} /> : null}
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
                        sx={{ ml: imageUrl ? 0 : 1 }}
                      >
                        {title}
                      </Typography>
                    </Box>
                    {wip ? <IconImage name="time" title="Work in progress" /> : null}
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
