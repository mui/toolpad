import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Link from 'docs/src/modules/components/Link';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';

export default function Banner({ content }) {
  return (
    <Container
      sx={{
        pt: 2,
        pb: { xs: 2, sm: 4, md: 8 },
        scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
      }}
      id="banner-full-width"
    >
      <Stack
        sx={{
          borderRadius: 1,
          p: 2,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'primaryDark.900' : 'primary.50'),
          border: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? 'primaryDark.500' : 'primary.100',
          display: 'flex',
          flexDirection: {
            xs: 'column',
            sm: 'row',
          },
          justifyContent: 'space-between',
          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },
        }}
      >
        <Box>
          <Typography fontWeight="bold" sx={{ mb: 0.5 }}>
            {content?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 700 }}>
            {content?.description}
          </Typography>
        </Box>
        <Button
          component={Link}
          noLinkStyle
          href={content?.action?.href}
          variant="contained"
          fullWidth
          endIcon={<KeyboardArrowRightRounded />}
          sx={{
            py: 1,
            ml: { xs: 0, sm: 2 },
            mt: { xs: 3, sm: 0 },
            width: { xs: '100%', sm: '50%', md: '15%' },
          }}
        >
          {content?.action?.label}
        </Button>
      </Stack>
    </Container>
  );
}

Banner.propTypes = {
  content: PropTypes.shape({
    action: PropTypes.shape({
      href: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
    description: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }),
};
