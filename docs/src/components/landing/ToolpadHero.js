import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import Link from 'docs/src/modules/components/Link';
import Typography from '@mui/material/Typography';
import IconImage from 'docs/src/components/icon/IconImage';
import GradientText from './GradientText';
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
          <GradientText>MUI Toolpad</GradientText>
        </Typography>
        <Typography variant="h1" sx={{ my: 2 }}>
          Low-code
          <br />
          <GradientText>admin builder</GradientText>
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 520, mx: 'auto' }}>
          Drag and drop pre-built components, connect to data sources and APIs, and build your
          internal tools 10x faster. Open-source and powered by MUI.
        </Typography>
        <Typography color="text.secondary" sx={{ fontWeight: 700, mb: 2, mx: 'auto' }}>
          Get notified of the beta release.
        </Typography>
        <TextField
          variant="outlined"
          placeholder="example@email.com"
          sx={{ mr: 2, mb: { xs: 2, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}
        />
        <Button
          component={Link}
          href={'/'}
          noLinkStyle
          size="large"
          variant="contained"
          endIcon={<KeyboardArrowRightRounded />}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Sign up
        </Button>
      </Box>
    </ToolpadHeroContainer>
  );
}
