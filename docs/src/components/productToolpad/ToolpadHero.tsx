import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import GradientText from 'docs/src/components/typography/GradientText';
import GetStartedButtons from 'docs/src/components/home/GetStartedButtons';
import HeroContainer from 'docs/src/layouts/HeroContainer';
import IconImage from 'docs/src/components/icon/IconImage';
import ROUTES from 'docs/src/route';

export default function ToolpadHero() {
  return (
    <HeroContainer
      left={
        <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
          <Typography
            fontWeight="bold"
            variant="body2"
            color={(theme) => (theme.palette.mode === 'dark' ? 'primary.400' : 'primary.600')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: { xs: 'center', md: 'flex-start' },
              '& > *': { mr: 1, width: 28, height: 28 },
            }}
          >
            <IconImage name="product-toolpad" /> MUI Toolpad
          </Typography>
          <Typography variant="h1" sx={{ my: 2, maxWidth: 500 }}>
            Toolpad
            <br />
            <GradientText>title</GradientText>
            <br /> here
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
            toolpad intro text
          </Typography>
          <GetStartedButtons
            installation="install intructions here"
            to={ROUTES.dataGridDocs}
            sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}
          />
        </Box>
      }
      rightSx={{
        p: { md: 2, lg: 3, xl: 4 },
        overflow: 'hidden', // the components on the Hero section are mostly illustrative, even though they're interactive. That's why scrolling is disabled.
      }}
      right={<div>content here</div>}
    />
  );
}
