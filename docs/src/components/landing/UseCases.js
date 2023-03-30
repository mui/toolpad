import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import SectionHeadline from 'docs/src/components/typography/SectionHeadline';

const cardMediaStyle = (imageUrl) => ({
  display: 'block',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  objectFit: 'contain',
  background: (theme) => `${theme.palette.primaryDark[800]} url(${imageUrl})`,
  backgroundSize: 'cover',
  borderRadius: '8px',
  paddingTop: '55%',
  overflow: 'auto',
  boxShadow: (theme) =>
    theme.palette.mode === 'dark'
      ? `0 0 8px 2px ${theme.palette.primaryDark[600]}, 0 4px 40px ${theme.palette.primaryDark[500]}`
      : `0 0 8px 2px ${theme.palette.primary[100]}, 0 4px 40px ${theme.palette.primary[100]}`,
});

export default function CardGrid(props) {
  const { content } = props;
  return (
    <Box
      sx={{
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? `radial-gradient(140% 150% at 50% 10%, transparent 40%,  ${theme.palette.primary[700]} 90%,  transparent 100%)`
            : `radial-gradient(140% 150% at 50% 10%, transparent 50%,  ${theme.palette.primary[100]} 90%,  transparent 100%)`,
      }}
    >
      <Container sx={{ py: { xs: 8, sm: 12 } }}>
        <SectionHeadline overline={content.overline} title={content.Headline} />
        <Grid container columns={{ xs: 1, sm: 3 }} spacing={4}>
          {content.cards.map(({ title, imageUrl, description }) => (
            <Grid key={title} xs={3} sm={1}>
              <Box key={title}>
                <Box sx={cardMediaStyle(imageUrl)} />
                <Box mt={2}>
                  <Typography component="h3" fontWeight="medium" color="text.primary" mb={0.5}>
                    {title}
                  </Typography>
                  <Typography variant="body" color="text.secondary">
                    {description}
                  </Typography>
                </Box>
              </Box>
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
        imageUrl: PropTypes.string,
        title: PropTypes.string.isRequired,
      }),
    ),
    Headline: PropTypes.node.isRequired,
    overline: PropTypes.string.isRequired,
  }).isRequired,
};
