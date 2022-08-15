import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import SectionHeadline from 'docs/src/components/typography/SectionHeadline';
import IconImage from 'docs/src/components/icon/IconImage';

const CardRootStyle = (imageUrl) => ({
  px: imageUrl ? 0 : 2,
  pb: 3,
  pt: imageUrl ? 0 : 3,
  height: '100%',
});

const CardMediaStyle = (imageUrl) => ({
  display: 'block',
  backgroundSize: 'cover',
  minHeight: 140,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  objectFit: 'cover',
  background: `#001E3C url(${imageUrl})`,
  borderTopLeftRadius: '10px',
  borderTopRightRadius: '10px',
  borderWidth: '0px',
});

const CardContentRootStyle = (imageUrl) => ({
  px: imageUrl ? 2 : 0,
  pt: imageUrl ? 2 : 0,
  pb: 0,
});

function CardGrid(props) {
  const { content, span } = props;
  return (
    <Box
      sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'primaryDark.900' : 'grey.50'),
      }}
    >
      <Container sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
        <SectionHeadline
          overline="Features"
          title={content.Headline}
          localTheme={(mode) => ({
            overlineColor: mode === 'dark' ? '#f9a426' : '#f9a426',
          })}
        />
        <Grid container spacing={2}>
          {content.cards.map(({ icon, title, wip, imageUrl, description }) => (
            <Grid key={title} item xs={12} sm={6} md={span}>
              <Paper variant="outlined" sx={CardRootStyle(imageUrl)}>
                {imageUrl ? <Box sx={CardMediaStyle(imageUrl)} /> : null}
                <Box sx={CardContentRootStyle(imageUrl)}>
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

export default CardGrid;

CardGrid.propTypes = {
  content: PropTypes.shape({
    cards: PropTypes.arrayOf(
      PropTypes.shape({
        description: PropTypes.string.isRequired,
        icon: PropTypes.node,
        imageUrl: PropTypes.string,
        title: PropTypes.string.isRequired,
        wip: PropTypes.bool,
      }),
    ),
    Headline: PropTypes.node.isRequired,
  }).isRequired,
  span: PropTypes.number.isRequired,
};
