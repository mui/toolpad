import * as React from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Link from 'docs/src/modules/components/Link';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';

export default function Banner(props) {
  const { title, description, href, label, category, action, docs } = props;
  return (
    <Box
      sx={{
        bgcolor: (theme) => {
          if (theme.palette.mode === 'dark') {
            return theme.palette.primaryDark[900];
          }
          if (docs) {
            return 'default';
          }
          return theme.palette.grey[50];
        },
      }}
    >
      <Container
        sx={{
          pt: 0,
          pb: { xs: 2, sm: 8, md: docs ? 1 : 16 },
          px: docs ? { xs: 0, sm: 0, md: 3 } : 'default',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        <Stack
          sx={{
            borderRadius: 1,
            px: 2,
            py: docs ? 3 : 2,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.primaryDark[900], 0.5)
                : 'primary.50',
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? 'primaryDark.500' : 'primary.100',
            display: 'flex',
            flexDirection: {
              xs: 'column',
              sm: 'row',
            },
            width: '100%',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
          }}
        >
          <div>
            <Typography fontWeight="bold" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            <Typography
              variant={docs ? 'body1' : 'body2'}
              color="text.secondary"
              sx={{ maxWidth: 700 }}
            >
              {description}
            </Typography>
          </div>
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
            endIcon={<KeyboardArrowRightRounded />}
            sx={{
              py: 1,
              px: {
                md: 2,
              },
              ml: { xs: 0, sm: 2 },
              mt: { xs: 3, sm: 0 },
              width: { xs: '100%', sm: '50%', md: 'auto' },
            }}
          >
            {label}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}

Banner.propTypes = {
  action: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  docs: PropTypes.bool,
  href: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
