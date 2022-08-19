import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconImage from 'docs/src/components/icon/IconImage';
import GradientText from './GradientText';
import SignUp from './SignUp';
import ToolpadHeroContainer from '../../layouts/ToolpadHeroContainer';

export default function ToolpadHero() {
  return (
    <ToolpadHeroContainer>
      <Box sx={{ textAlign: { xs: 'center', md: 'center' } }}>
        <Typography
          fontWeight="bold"
          variant="body2"
          color={(theme) => (theme.palette.mode === 'dark' ? 'primary.400' : 'primary.600')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'center', md: 'center' },
            '& > *': { mr: 1, height: 28 },
          }}
        >
          <IconImage name="product-toolpad" />
          <span style={{ display: 'flex', alignItems: 'center', color: 'blue.500' }}>
            MUI Toolpad
          </span>
        </Typography>
        <Typography variant="h1" sx={{ my: 2 }}>
          Low-code
          <br />
          <GradientText>admin builder</GradientText>
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 540, mx: 'auto' }}>
          Drag and drop pre-built components, connect to data sources and APIs, and build your
          internal tools 10x faster. Open-source and powered by MUI.
        </Typography>
        <Typography color="text.secondary" sx={{ fontWeight: 700, mb: 2, mx: 'auto' }}>
          Sign up for early access to the beta release.
        </Typography>
        <SignUp
          sx={{
            '& > div': {
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'center',
              maxWidth: 'initial',
            },
          }}
        />
      </Box>
    </ToolpadHeroContainer>
  );
}
