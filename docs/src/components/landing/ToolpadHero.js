import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import Link from 'docs/src/modules/components/Link';
import Typography from '@mui/material/Typography';
import InputBase, { inputBaseClasses } from '@mui/material/InputBase';
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
          <GradientText sx={{ display: 'flex', alignItems: 'center' }}>MUI Toolpad</GradientText>
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
          Get notified of the beta release.
        </Typography>
        <InputBase
          id="email-landing"
          name="email"
          type="email"
          placeholder="example@email.com"
          inputProps={{ required: true }}
          sx={{
            mr: 2,
            mb: { xs: 2, sm: 0 },
            minWidth: { xs: 220, sm: 360 },
            width: { xs: '100%', sm: 'auto' },
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? theme.palette.primaryDark[900] : '#fff',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 1px 2px 0 rgba(0 0 0 / 1)'
                : '0 1px 2px 0 rgba(0 0 0 / 0.1)',
            borderRadius: 1,
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark'
                ? theme.palette.primaryDark[500]
                : theme.palette.grey[300],
            px: 1,
            py: 0.5,
            height: 50,
            typography: 'body2',
            '&:hover': {
              borderColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? theme.palette.primaryDark[300]
                  : theme.palette.grey[400],
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 1px 2px 0 rgba(0 0 0 / 1)'
                  : '0 1px 2px 0 rgba(0 0 0 / 0.2)',
            },
            [`&.${inputBaseClasses.focused}`]: {
              borderColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? theme.palette.primaryDark[300]
                  : theme.palette.primary[500],
              outline: '3px solid',
              outlineColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? theme.palette.primaryDark[500]
                  : theme.palette.primary[200],
            },
          }}
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
