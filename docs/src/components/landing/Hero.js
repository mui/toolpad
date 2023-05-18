import * as React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import SvgMuiLogo from 'docs/src/icons/SvgMuiLogo';
import IconImage from 'docs/src/components/icon/IconImage';
import GradientText from 'docs/src/components/typography/GradientText';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import GetStartedButtons from 'docs/src/components/home/GetStartedButtons';
import ROUTES from '../../route';
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
          <Chip label="Alpha" component="span" color="primary" size="small" variant="outlined" />
        </Typography>
        <Typography variant="h1" sx={{ my: 2 }}>
          Low-code
          <br />
          <GradientText>admin builder</GradientText>
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', mb: 4 }}>
          Build scalable and secure internal tools locally. Use your own IDE, drag and drop
          pre-built components or create your own.
        </Typography>
        <GetStartedButtons
          sx={{ justifyContent: 'center' }}
          installation={'npx create-toolpad-app'}
          to={ROUTES.toolpadQuickstart}
        />
        <Box
          sx={{
            mx: 'auto',
            mt: 6,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SvgMuiLogo width={20} />
            <Typography color="text.primary" fontWeight="medium" variant="body2">
              Powered by MUI
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DataObjectRoundedIcon color="primary" />
            <Typography color="text.primary" fontWeight="medium" variant="body2">
              Open source
            </Typography>
          </Box>
        </Box>
      </Box>
    </ToolpadHeroContainer>
  );
}
