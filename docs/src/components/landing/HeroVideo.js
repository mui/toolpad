import * as React from 'react';
import Container from '@mui/material/Container';
import DemoVideo from './DemoVideo';

export default function HeroVideo() {
  return (
    <Container
      id="hero-container-right-area"
      aria-hidden="true"
      sx={{
        py: { xs: 4, sm: 8 },
        display: 'flex',
        alignItems: 'center',
        minWidth: '50vw',
      }}
    >
      <DemoVideo />
    </Container>
  );
}
