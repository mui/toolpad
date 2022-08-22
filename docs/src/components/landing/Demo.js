import * as React from 'react';
import Box from '@mui/material/Box';
import dynamic from 'next/dynamic';

const DynamicVideo = dynamic(() => import('./DemoVideo'), {
  suspense: true,
});

export default function HeroDemo() {
  return (
    <React.Suspense
      fallback={
        <Box
          sx={{
            backgroundRepeat: 'no-repeat',
            backgroundPositionX: 'left',
            backgroundSize: 'contain',
            backgroundPositionY: {
              xs: 'center',
              sm: 'center',
              md: 'top',
              lg: 'top',
            },
            backgroundImage: 'url("/static/toolpad/marketing/hero-screenshot.svg")',
          }}
        />
      }
    >
      <DynamicVideo />
    </React.Suspense>
  );
}
