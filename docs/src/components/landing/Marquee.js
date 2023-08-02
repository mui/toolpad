import * as React from 'react';
import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import SignUp from './SignUp';

function Marquee({ content }) {
  return (
    <Container
      sx={[
        (theme) => ({
          mx: 0,
          minWidth: '100%',
          py: { xs: 4, sm: 6, md: 12 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100%',
          backgroundImage: `linear-gradient(180deg, ${
            (theme.vars || theme).palette.primaryDark[900]
          } 0%, ${(theme.vars || theme).palette.primaryDark[800]})`,
        }),
      ]}
    >
      <Typography
        textAlign="center"
        variant="h2"
        sx={{
          mx: 'auto',
          color: 'primary.50',
        }}
      >
        {content.title}
      </Typography>
      <Typography
        textAlign="center"
        sx={{
          mt: 1,
          mb: 4,
          mx: 'auto',
          color: 'grey.500',
        }}
      >
        {content.subtitle}
      </Typography>
      <SignUp
        sx={{
          '& > div': {
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center',
            maxWidth: 'initial',
          },
        }}
      />
    </Container>
  );
}

Marquee.propTypes = {
  content: PropTypes.shape({
    action: PropTypes.shape({
      href: PropTypes.string.isRequired,
    }).isRequired,
    subtitle: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};

export default Marquee;
