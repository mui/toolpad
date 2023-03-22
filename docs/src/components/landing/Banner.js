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
    <Box>
      <Container
        sx={{
          pt: 0,
          pb: { xs: 2, sm: 8, md: docs ? 1 : 12 },
          px: docs ? { xs: 0, sm: 0, md: 0 } : 'default',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        <Stack
          sx={{
            borderRadius: 1,
            px: 2,
            py: docs ? 2.5 : 2,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? `linear-gradient(230deg, ${alpha(
                    theme.palette.primaryDark[400],
                    0.4,
                  )} 0%, ${alpha(theme.palette.primaryDark[300], 0.4)} 150%)`
                : `linear-gradient(45deg, ${theme.palette.primary[50]} 0%, ${alpha(
                    theme.palette.primary[200],
                    0.4,
                  )} 150%)`,
            border: '1px solid',
            borderColor: (theme) => `${alpha(theme.palette.primaryDark[300], 0.5)}`,
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
              sx={{ maxWidth: 500 }}
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
  title: PropTypes.string,
};
