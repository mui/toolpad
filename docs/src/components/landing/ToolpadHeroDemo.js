import * as React from 'react';
// import Box from '@mui/material/Box';
import ToolpadHeroContainer from '../../layouts/ToolpadHeroContainer';

export default function ToolpadHero() {
  return (
    <ToolpadHeroContainer
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
        backgroundImage: 'url("/static/toolpad/marketing/product-toolpad-app.svg")',
      }}
    />
  );
}
