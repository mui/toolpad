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
          mt: 4,
          mx: 0,
          minWidth: '100%',
          py: { xs: 4, sm: 6, md: 12 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          // background: `linear-gradient(180deg, ${theme.palette.primaryDark[900]} 0%, ${theme.palette.primaryDark[800]})`,
          background: `radial-gradient(140% 150% at 50% 10%, transparent 20%,  ${theme.palette.primary[100]} 90%,  transparent 100%)`,
          borderBottom: '1px solid',
          borderColor: 'grey.200',
        }),
        (theme) =>
          theme.applyDarkStyles({
            borderColor: 'primaryDark.600',
            background: `linear-gradient(180deg, ${theme.palette.primaryDark[900]} 0%, ${theme.palette.primaryDark[800]})`,
          }),
      ]}
    >
      <Typography
        textAlign="center"
        variant="h2"
        sx={{
          mt: 4,
          mx: 'auto',
          color: (theme) => theme.palette.primary[800],
        }}
      >
        {content.title}
      </Typography>
      <Typography
        textAlign="center"
        sx={[
          {
            mt: 1,
            mb: 4,
            mx: 'auto',
            color: 'grey.600',
          },
          (theme) => theme.applyDarkStyles({ color: 'grey.500' }),
        ]}
      >
        {content.subtitle}
      </Typography>
      <Typography
        component="label"
        variant="body2"
        sx={[
          { fontWeight: 'medium', display: 'block', mb: 1, mx: 'auto', color: `text.secondary` },
          (theme) => theme.applyDarkStyles({ color: '#fff' }),
        ]}
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
