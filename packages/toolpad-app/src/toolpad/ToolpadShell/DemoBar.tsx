import * as React from 'react';
import { Box, Button, Link, styled, Typography } from '@mui/material';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import { blueDark, grey } from '../../theme';
import { DOCUMENTATION_INSTALLATION_URL, LANDING_PAGE_URL } from '../../constants';

const DemoBarContainer = styled(Box)({
  alignItems: 'center',
  backgroundColor: blueDark[50],
  bottom: 0,
  color: grey[700],
  display: 'flex',
  height: 60,
  justifyContent: 'space-between',
  left: 0,
  paddingLeft: 20,
  paddingRight: 20,
  position: 'absolute',
  width: '100vw',
  zIndex: 1,
});

export default function ToolpadShell() {
  return (
    <DemoBarContainer>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        Demo version
      </Typography>
      <Typography variant="body2">
        Stay updated with our progress at{' '}
        <Link
          href={LANDING_PAGE_URL}
          target="_blank"
          underline="always"
          sx={{
            color: grey[700],
            fontWeight: 'normal',
            textDecorationColor: grey[700],
            '&:hover': { color: grey[700] },
          }}
        >
          mui.com/toolpad
        </Link>
      </Typography>
      <Link href={DOCUMENTATION_INSTALLATION_URL} target="_blank">
        <Button size="medium" variant="contained" endIcon={<KeyboardArrowRightRounded />}>
          Self-host
        </Button>
      </Link>
    </DemoBarContainer>
  );
}
