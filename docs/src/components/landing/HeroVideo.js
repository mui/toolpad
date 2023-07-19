import * as React from 'react';
import Box from '@mui/material/Box';
import DemoVideo from './DemoVideo';

export default function HeroVideo() {
  return (
    <Box
      id="hero-container-right-area"
      aria-hidden="true"
      sx={[
        {
          display: 'flex',
          alignItems: 'center',
          p: 4,
          minWidth: '50vw',
        },
      ]}
    >
      <DemoVideo />
    </Box>
  );
}
