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
        mt: 8,
        mx: 0,
        minWidth: '100%',
        py: { xs: 4, sm: 6, md: 12 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: `linear-gradient(180deg, ${theme.palette.primaryDark[900]} 0%, ${theme.palette.primaryDark[800]})`,
        borderBottom: '1px solid',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? 'primaryDark.600' : 'grey.200'),
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
