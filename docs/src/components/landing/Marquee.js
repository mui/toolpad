import * as React from 'react';
import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import SignUp from './SignUp';

function Marquee({ content }) {
  return (
    <Container
      sx={(theme) => ({
        mt: 8,
        mx: 0,
        minWidth: '100%',
        py: { xs: 4, sm: 6, md: 12 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: `linear-gradient(180deg, ${theme.palette.primaryDark[900]} 0%, ${theme.palette.primaryDark[800]})`,
        borderBottom: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'primaryDark.600' : 'grey.200',
      })}
    >
      <Typography
        color="white"
        textAlign="center"
        variant="h2"
        sx={{
          mt: 4,
          mx: 'auto',
        }}
      >
        {content.title}
      </Typography>
      <Typography
        color="grey.500"
        textAlign="center"
        sx={{
          mt: 1,
          mb: 4,
          mx: 'auto',
        }}
      >
        {content.subtitle}
      </Typography>
      <Typography
        component="label"
        variant="body2"
        color={(theme) => (theme.palette.mode === 'dark' ? '#fff' : `text.secondary`)}
        sx={{ fontWeight: 'medium', display: 'block', mb: 1, mx: 'auto' }}
        htmlFor="email-landing"
      >
        {content.action.label}
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
      label: PropTypes.string.isRequired,
    }).isRequired,
    subtitle: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};

export default Marquee;
