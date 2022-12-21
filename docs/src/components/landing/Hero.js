import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import IconImage from 'docs/src/components/icon/IconImage';
import GradientText from 'docs/src/components/typography/GradientText';
import SignUp from './SignUp';
import ToolpadHeroContainer from '../../layouts/ToolpadHeroContainer';

export default function Hero() {
  return (
    <ToolpadHeroContainer>
      <Box
        sx={{
          textAlign: { xs: 'center', md: 'center' },
          mt: { xs: '20px', md: '100px' },
        }}
      >
        <Typography
          fontWeight="bold"
          variant="body2"
          color={(theme) => (theme.palette.mode === 'dark' ? 'primary.400' : 'primary.600')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'center', md: 'center' },
          }}
        >
          <IconImage name="product-toolpad" width="28" height="28" sx={{ mr: 1 }} />
          <Box component="span" sx={{ mr: 1 }}>
            MUI Toolpad
          </Box>
          <Chip label="Alpha" component="span" color="grey" size="small" />
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
        <Button
          size="large"
          variant="contained"
          href="https://demo.toolpad.io/"
          target="_blank"
          endIcon={<KeyboardArrowRightRounded />}
          sx={{ width: { xs: '100%', sm: 'auto' }, mb: 3 }}
        >
          Try demo
        </Button>
        <Typography
          component="label"
          color={(theme) => (theme.palette.mode === 'dark' ? '#fff' : `text.secondary`)}
          sx={{ fontWeight: 'bold', display: 'block', mb: 1, mx: 'auto' }}
          htmlFor="email-landing"
        >
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
