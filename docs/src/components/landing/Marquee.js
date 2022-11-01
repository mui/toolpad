import * as React from 'react';
import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Link from 'docs/src/modules/components/Link';
import Typography from '@mui/material/Typography';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';

function Marquee({ content }) {
  return (
    <Container
      sx={(theme) => ({
        py: { xs: 4, sm: 6, md: 8 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderImage: `conic-gradient(${theme.palette.primaryDark[700]} 0deg 360deg) fill 1/ /0 50vw`,
      })}
    >
      <Typography
        color="grey.50"
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
        color="text.secondary"
        textAlign="center"
        sx={{
          my: 2,
          mx: 'auto',
        }}
      >
        {content.subtitle}
      </Typography>
      <Button
        component={Link}
        href={content.action.href}
        data-ga-event-category="ToolpadLanding"
        data-ga-event-label={content.action.label}
        data-ga-event-action="SelfHost"
        noLinkStyle
        size="large"
        variant="contained"
        endIcon={<KeyboardArrowRightRounded />}
        sx={{ width: { xs: '100%', sm: 'auto' } }}
      >
        {content.action.label}
      </Button>
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
