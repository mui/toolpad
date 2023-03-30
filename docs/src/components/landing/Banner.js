import * as React from 'react';
import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Link from 'docs/src/modules/components/Link';
import Typography from '@mui/material/Typography';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';

function Banner(props) {
  const { title, description, href, label, category, action } = props;
  return (
    <Container
      sx={{
        mx: 0,
        minWidth: '100%',
        py: { xs: 4, sm: 8 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography
        textAlign="center"
        variant="h4"
        sx={{
          mt: 4,
          mx: 'auto',
        }}
      >
        {title}
      </Typography>
      <Typography
        color="text.secondary"
        textAlign="center"
        sx={{
          mt: 1,
          mb: 4,
          mx: 'auto',
          maxWidth: '500px',
        }}
      >
        {description}
      </Typography>
      <Button
        component={Link}
        noLinkStyle
        data-ga-event-category={category}
        data-ga-event-label={label}
        data-ga-event-action={action}
        target="_blank"
        rel="noopener"
        href={href}
        variant="contained"
        fullWidth
        size="large"
        endIcon={<KeyboardArrowRightRounded />}
        sx={{ width: { xs: '100%', sm: 'auto' } }}
      >
        {label}
      </Button>
    </Container>
  );
}

Banner.propTypes = {
  action: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  title: PropTypes.string,
};

export default Banner;
