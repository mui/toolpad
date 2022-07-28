import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import Link from 'docs/src/modules/components/Link';
import Typography from '@mui/material/Typography';
import GradientText from 'docs/src/components/typography/GradientText';
import IconImage from 'docs/src/components/icon/IconImage';
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
            '& > *': { mr: 1, width: 28, height: 28 },
          }}
        >
          <IconImage name="product-toolpad" /> Toolpad
        </Typography>
        <Typography variant="h1" sx={{ my: 2 }}>
          Low-code
          <br />
          <GradientText>admin builder</GradientText>
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 520, mx: 'auto' }}>
          Drag and drop pre-built components, connect to data sources, APIs and build your internal
          tools 10x faster. Open-source and powered by MUI.
        </Typography>
        <TextField variant="outlined" placeholder="example@email.com" sx={{ mr: 2 }} />
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
