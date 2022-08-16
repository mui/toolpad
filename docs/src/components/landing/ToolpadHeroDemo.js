import * as React from 'react';
import Box from '@mui/material/Box';
import dynamic from 'next/dynamic';
import ToolpadHeroContainer from '../../layouts/ToolpadHeroContainer';

const DynamicVideo = dynamic(() => import('./ToolpadDemoVideo'), {
  suspense: true,
});

export default function ToolpadHero() {
  return (
    <ToolpadHeroContainer>
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
    </ToolpadHeroContainer>
  );
}
