import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import SvgMuiLogo from 'docs/src/icons/SvgMuiLogomark';
import IconImage from 'docs/src/components/icon/IconImage';
import GradientText from 'docs/src/components/typography/GradientText';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import GetStartedButtons from 'docs/src/components/home/GetStartedButtons';
import DemoVideo from './DemoVideo';
import ROUTES from '../../route';

function TypingAnimation() {
  const words = ['APIs', 'scripts', 'SQL'];
  const [text, setText] = useState('');
  const [fullText, setFullText] = useState(words[0]);
  const [letterIndex, setLetterIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  const l = words.length;
  React.useEffect(() => {
    if (letterIndex < fullText.length) {
      setTimeout(() => {
        setText(text + fullText[letterIndex]);
        setLetterIndex(letterIndex + 1);
      }, 100);
    } else {
      setTimeout(() => {
        const nextIndex = (wordIndex + 1) % l;
        setWordIndex(nextIndex);
        setFullText(words[nextIndex]);
        setText('');
        setLetterIndex(0);
      }, 2000);
    }
  });

  return <span>{text}</span>;
}

export default function Hero2() {
  return (
    <Box sx={{ overflow: 'hidden' }}>
      <Container
        sx={{
          py: { xs: 8, lg: 10, xl: 12 },
          // pt: { xs: 2, sm: 4, md: 4, lg: 8 },
          // pb: { xs: 3, sm: 4, md: 6, lg: 12 },
          minHeight: 500,
          transition: '0.3s',
        }}
      >
        <Grid container alignItems="center" wrap="nowrap" sx={{ height: '100%', mx: 'auto' }}>
          <Grid item md={7} lg={6} sx={{ m: 'auto' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography
                fontWeight="bold"
                variant="body2"
                sx={[
                  (theme) => ({
                    display: 'flex',
                    alignItems: 'center',
                    color: (theme.vars || theme).palette.primary[600],
                    ...theme.applyDarkStyles({
                      color: (theme.vars || theme).palette.primary[400],
                    }),
                  }),
                ]}
              >
                <IconImage name="product-toolpad" width="28" height="28" sx={{ mr: 1 }} />
                <Box component="span" sx={{ mr: 1 }}>
                  MUI Toolpad
                </Box>
                <Chip
                  label="Beta"
                  component="span"
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              </Typography>
              <Typography
                variant="h1"
                sx={{
                  my: 1,
                  minWidth: { xs: 'auto', sm: 500 },
                }}
              >
                Turn your <TypingAnimation />
                <br />
                <GradientText>into UIs</GradientText>
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 520, mb: 2 }}>
                Build scalable and secure internal tools locally. Use your own IDE, drag and drop
                pre-built components or create your own.
              </Typography>
              <GetStartedButtons
                installation={'npx create-toolpad-app'}
                to={ROUTES.toolpadQuickstart}
              />
              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  gap: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <SvgMuiLogo width={20} />
                  <Typography color="text.secondary" fontWeight="medium" variant="body2">
                    Powered by Material UI
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <KeyRoundedIcon color="primary" />
                  <Typography color="text.secondary" fontWeight="medium" variant="body2">
                    Open source
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid
            item
            md={6}
            lg={6}
            sx={{ maxHeight: '100%', display: { xs: 'none', md: 'initial' } }}
          >
            <Box
              id="hero-container-right-area"
              aria-hidden="true"
              sx={[
                {
                  display: 'flex',
                  alignItems: 'center',
                  pl: 2,
                  pr: 4,
                  minWidth: '50vw',
                },
              ]}
            >
              <DemoVideo />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
