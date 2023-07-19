import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import SvgMuiLogo from 'docs/src/icons/SvgMuiLogomark';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import IconImage from 'docs/src/components/icon/IconImage';
import GradientText from 'docs/src/components/typography/GradientText';
import GetStartedButtons from 'docs/src/components/home/GetStartedButtons';
import GithubStars from './GithubStars';
import CodeBlock from './CodeBlock';

import ROUTES from '../../route';
import ToolpadHeroContainer from '../../layouts/ToolpadHeroContainer';

const HeroModeSwitch = styled(Switch)(({ theme }) => ({
  width: 60,
  height: 30,
  padding: 7,
  justifySelf: 'center',
  [theme.breakpoints.between('md', 1100)]: {
    left: '-8vw',
  },
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(30px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8, <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M226-160q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19Zm254 0q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19Zm254 0q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19ZM226-414q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19Zm254 0q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19Zm254 0q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19ZM226-668q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19Zm254 0q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19Zm254 0q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19Z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.grey[50],
        borderColor: theme.palette.grey[300],
        ...theme.applyDarkStyles({
          borderColor: theme.palette.primaryDark[400],
          backgroundColor: theme.palette.primaryDark[700],
        }),
      },
    },
    '&:hover + .MuiSwitch-track': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.primary[400],
    width: 24,
    height: 24,
    transform: 'translateY(4px)',
    '&:before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path fill="${encodeURIComponent(
        '#fff',
      )}" d="M320-242 80-482l242-242 43 43-199 199 197 197-43 43Zm318 2-43-43 199-199-197-197 43-43 240 240-242 242Z"/></svg>')`,
    },
    ...theme.applyDarkStyles({
      backgroundColor: theme.palette.primary[600],
    }),
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.grey[50],
    borderRadius: 20 / 2,
    border: '1px solid',
    borderColor: theme.palette.grey[300],
    transition: theme.transitions.create(['background-color', 'border']),
    ...theme.applyDarkStyles({
      borderColor: theme.palette.primaryDark[400],
      backgroundColor: theme.palette.primaryDark[700],
    }),
  },
  '&:hover .MuiSwitch-track': {
    borderColor: theme.palette.primary.main,
  },
}));

function TypingAnimation() {
  const words = ['APIs', 'scripts', 'SQL'];
  const [text, setText] = React.useState('');
  const [fullText, setFullText] = React.useState(words[0]);
  const [letterIndex, setLetterIndex] = React.useState(0);
  const [wordIndex, setWordIndex] = React.useState(0);

  const l = words.length;
  React.useEffect(() => {
    let timer;
    if (letterIndex < fullText.length) {
      timer = setTimeout(() => {
        setText(text + fullText[letterIndex]);
        setLetterIndex(letterIndex + 1);
      }, 100);
    } else {
      timer = setTimeout(() => {
        const nextIndex = (wordIndex + 1) % l;
        setWordIndex(nextIndex);
        setFullText(words[nextIndex]);
        setText('');
        setLetterIndex(0);
      }, 2000);
    }
    return () => clearTimeout(timer);
  });

  return <span>{text}</span>;
}

export default function Hero() {
  const [heroAppMode, setHeroAppMode] = React.useState(false);
  const handleModeChange = React.useCallback((event) => {
    setHeroAppMode(event.target.checked);
  }, []);

  return (
    <ToolpadHeroContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
          <Chip label="Beta" component="span" color="primary" size="small" variant="outlined" />
        </Typography>
        <Typography variant="h1" sx={{ my: 1, minWidth: { xs: 'auto', sm: 600 } }}>
          Turn your <TypingAnimation />
          <br />
          <GradientText>into UIs</GradientText>
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 520, mb: 2, textWrap: 'balance' }}>
          Build scalable and secure internal tools locally. Use your own IDE, <br /> drag and drop
          pre-built components or create your own.
        </Typography>
        <GetStartedButtons installation={'npx create-toolpad-app'} to={ROUTES.toolpadQuickstart} />
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
        <GithubStars />
      </Box>
      <Box
        sx={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          rowGap: 1,
        }}
      >
        <CodeBlock appMode={heroAppMode} />
        <Box
          className="MuiToolpadHero-image"
          sx={[
            (theme) => ({
              position: { xs: 'absolute', sm: 'relative', md: 'absolute' },
              gridRowStart: 1,
              gridRowEnd: 2,
              gridColumnStart: { xs: 'unset', sm: 1, md: 'unset' },
              background: `${
                (theme.vars || theme).palette.primaryDark[800]
              } url(/static/toolpad/marketing/hero.png)`,
              backgroundSize: 'cover',
              aspectRatio: 10 / 7,
              width: '100%',
              borderRadius: 1,
              border: '1px solid',
              borderColor: (theme.vars || theme).palette.divider,
              backgroundRepeat: 'no-repeat',
              backfaceVisibility: 'hidden',
              transition: 'all 0.6s ease',
              transform: {
                xs: `rotateY(${heroAppMode ? '0' : '180'}deg)`,
                sm: 'unset',
                md: `rotateY(${heroAppMode ? '0' : '180'}deg)`,
              },
            }),
            (theme) =>
              theme.applyDarkStyles({
                borderColor: (theme.vars || theme).palette.divider,
                backgroundRepeat: 'no-repeat',
                boxShadow: '0px 2px 16px rgba(0,0,0, 0.5)',
              }),
          ]}
        />
        <Box
          sx={{
            display: { xs: 'grid', sm: 'none', md: 'grid' },
            gridRowStart: 2,
            transform: { xs: 'scale(0.75)', sm: 'unset' },
          }}
        >
          <HeroModeSwitch checked={heroAppMode} onChange={handleModeChange} />
        </Box>
      </Box>
    </ToolpadHeroContainer>
  );
}
