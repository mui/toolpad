import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import { Link } from '@mui/docs/Link';
import NpmCopyButton from 'docs/src/components/action/NpmCopyButton';

export default function GetStartedButtons(props) {
  const { installation, primaryLabel, primaryUrl, secondaryLabel, secondaryUrl, ...other } = props;
  return (
    <React.Fragment>
      <Box
        {...other}
        sx={{
          display: 'flex',
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          '&& > *': {
            minWidth: { xs: '100%', md: '0%' },
          },
          ...other.sx,
        }}
      >
        <Button
          href={primaryUrl}
          component={Link}
          noLinkStyle
          size="large"
          variant="contained"
          endIcon={<KeyboardArrowRightRounded />}
          sx={{
            flexShrink: 0,
            mr: { xs: 0, md: 1.5 },
            mb: { xs: 2, md: 0 },
          }}
        >
          {primaryLabel}
        </Button>
        {secondaryUrl ? (
          <Button
            href={secondaryUrl}
            component={Link}
            noLinkStyle
            target={'_blank'}
            variant="outlined"
            size="large"
            color="secondary"
            endIcon={<KeyboardArrowRightRounded />}
          >
            {secondaryLabel}
          </Button>
        ) : null}
      </Box>
      <NpmCopyButton installation={installation} sx={{ mt: 2 }} />
    </React.Fragment>
  );
}

GetStartedButtons.propTypes = {
  installation: PropTypes.string.isRequired,
  primaryLabel: PropTypes.string.isRequired,
  primaryUrl: PropTypes.string.isRequired,
  secondaryLabel: PropTypes.string,
  secondaryUrl: PropTypes.string,
};
