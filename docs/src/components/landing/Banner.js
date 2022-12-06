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
  const { content } = props;
  return (
    <Box>
      <Container
        sx={{
          pt: 0,
          pb: { xs: 2, sm: 8, md: 16 },
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        <Stack
          sx={{
            borderRadius: 1,
            p: 2,
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
              {content.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 700 }}>
              {content.description}
            </Typography>
          </div>
          <Button
            component={Link}
            noLinkStyle
            data-ga-event-category="ToolpadLanding"
            data-ga-event-label={content.action.label}
            data-ga-event-action="Upvote"
            target="_blank"
            rel="noopener"
            href={content.action.href}
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
            {content.action.label}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}

Banner.propTypes = {
  content: PropTypes.shape({
    action: PropTypes.shape({
      href: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }).isRequired,
    description: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};
