import * as React from 'react';
import PropTypes from 'prop-types';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import SvgMuiLogo from 'docs/src/icons/SvgMuiLogomark';
import IconImage from 'docs/src/components/icon/IconImage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import GradientText from 'docs/src/components/typography/GradientText';
// import GetStartedButtons from './GetStartedButtons';
import GetStartedButtons from 'docs/src/components/home/GetStartedButtons';
import GithubStars from './GithubStars';
import CodeBlock from './CodeBlock';
import ROUTES from '../../route';
import ToolpadHeroContainer from '../../layouts/ToolpadHeroContainer';

const HeroModeSwitch = styled(Switch)(({ theme }) => ({
  width: 36,
  height: 22,
  padding: 0,
  borderRadius: 99,
  border: '1px solid',
  borderColor: theme.palette.grey[200],
  justifySelf: 'center',
  ...theme.applyDarkStyles({
    borderColor: theme.palette.primaryDark[600],
    backgroundColor: theme.palette.primary[600],
  }),
  '& .MuiSwitch-switchBase': {
    padding: 1,
    color: '#fff',
    '&.Mui-checked': {
      transform: 'translateX(14px)',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.grey[50],
        ...theme.applyDarkStyles({
          backgroundColor: theme.palette.primaryDark[800],
        }),
      },
    },
  },
  '& .MuiSwitch-thumb': {
    padding: 0,
    height: 14,
    width: 14,
    boxShadow: 'none',
    backgroundColor: theme.palette.primary[400],
  },
  '& .MuiSwitch-track': {
    backgroundColor: theme.palette.grey[50],
    ...theme.applyDarkStyles({
      backgroundColor: theme.palette.primaryDark[800],
    }),
  },
}));

const Img = styled('img')(({ theme }) => [
  {
    overflow: 'hidden',
    objectFit: 'cover',
    width: '100%',
    height: '100%',
    borderRadius: 10,
    border: '1px solid',
    borderColor: (theme.vars || theme).palette.grey[100],
  },
  theme.applyDarkStyles({
    borderColor: (theme.vars || theme).palette.primaryDark[700],
  }),
]);

const words = ['APIs', 'scripts', 'SQL'];

const LETTER_DELAY = 100;
const FRAME_DELAY = 3000;
const FRAMES = 6;

function TypingAnimation({ wordIndex, setWordIndex }) {
  const [text, setText] = React.useState(words[wordIndex]);
  const [fullText, setFullText] = React.useState(words[wordIndex]);
  const [letterIndex, setLetterIndex] = React.useState(fullText.length);
  const count = React.useRef(0);

  React.useEffect(() => {
    let timer;
    if (letterIndex < fullText.length) {
      timer = setTimeout(() => {
        setText(text + fullText[letterIndex]);
        setLetterIndex(letterIndex + 1);
      }, LETTER_DELAY);
    } else {
      timer = setTimeout(
        () => {
          const nextIndex = (wordIndex + 1) % words.length;
          setWordIndex(nextIndex);
          setFullText(words[nextIndex]);
          setText('');
          setLetterIndex(0);
          count.current += 1;
        },
        2 * FRAME_DELAY - (count.current ? LETTER_DELAY * fullText.length : 0),
      );
    }
    return () => clearTimeout(timer);
  }, [letterIndex, wordIndex, fullText, text, setWordIndex]);

  return <span>{text}</span>;
}

export default function Hero() {
  const [heroAppMode, setHeroAppMode] = React.useState(false);
  const isLargerThanMd = useMediaQuery((theme) => theme.breakpoints.up('md'));
  const isSmallerThanSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const handleModeChange = React.useCallback((event) => {
    setHeroAppMode(event.target.checked);
  }, []);
  const [wordIndex, setWordIndex] = React.useState(0);
  const [frameIndex, setFrameIndex] = React.useState(0);

  const [pauseHeroAnimation, setPauseHeroAnimation] = React.useState(false);

  React.useEffect(() => {
    const loop = setInterval(() => {
      if (!pauseHeroAnimation) {
        setHeroAppMode((prev) => !prev);
      }
      if ((isLargerThanMd || isSmallerThanSm) && !pauseHeroAnimation) {
        setFrameIndex((prev) => (prev + 1) % FRAMES);
      }
    }, FRAME_DELAY);
    return () => clearInterval(loop);
  }, [pauseHeroAnimation, frameIndex, isLargerThanMd, isSmallerThanSm]);

  const fileIndex = React.useMemo(() => Math.floor(frameIndex / 2), [frameIndex]);

  return (
    <ToolpadHeroContainer>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: { md: 500, lg: 600, xl: 'unset' },
        }}
      >
        <Typography
          fontWeight="bold"
          variant="body2"
          sx={[
            (theme) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: (theme.vars || theme).palette.primary[600],
              ...theme.applyDarkStyles({
                color: (theme.vars || theme).palette.primary[400],
              }),
            }),
          ]}
        >
          <IconImage width={28} height={28} loading="eager" name="product-toolpad" />
          <Box component="span" sx={{ ml: 1, mr: 1 }}>
            MUI Toolpad
          </Box>
          <Chip
            label="Introducing the Beta version"
            component="a"
            href={ROUTES.toolpadBetaBlog}
            color="primary"
            size="small"
            variant="outlined"
            clickable
            onDelete={() => {}}
            deleteIcon={<ChevronRightIcon />}
            sx={[
              (theme) => ({
                pb: 0.15,
                ml: 0.8,
                background: alpha(theme.palette.primary[50], 0.5),
                borderColor: (theme.vars || theme).palette.primary[100],
                ...theme.applyDarkStyles({
                  color: (theme.vars || theme).palette.primary[200],
                  borderColor: (theme.vars || theme).palette.primary[700],
                  background: alpha(theme.palette.primary[800], 0.3),
                }),
              }),
            ]}
          />
        </Typography>
        <Typography variant="h1" sx={{ my: 2, minWidth: { xs: 'auto', sm: 600 } }}>
          Turn your <TypingAnimation wordIndex={wordIndex} setWordIndex={setWordIndex} />
          <br />
          <GradientText>into UIs</GradientText>
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 520, mb: 3, textWrap: 'balance' }}>
          Build scalable and secure internal tools locally. Drag and drop to build UI, then connect
          to data sources with your own code.
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'center', md: 'flex-start' },
          }}
        >
          <GetStartedButtons
            primaryLabel={'Get started'}
            primaryUrl={ROUTES.toolpadQuickstart}
            secondaryLabel={'Book a demo'}
            secondaryUrl={ROUTES.toolpadDemoBooking}
            secondaryUrlTarget="_blank"
            altInstallation={'npx create-toolpad-app@latest'}
            sx={{ width: '100%' }}
          />
        </Box>
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'space-around', sm: 'start' },
            gap: 2,
          }}
        >
          <GithubStars />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <SvgMuiLogo width={20} />
            <Typography color="text.secondary" fontWeight="medium" variant="body2">
              Powered by Material UI
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          rowGap: 1,
        }}
        onMouseEnter={() => setPauseHeroAnimation(true)}
        onMouseLeave={() => setPauseHeroAnimation(false)}
      >
        <Box
          className="MuiToolpadHero-image"
          sx={[
            (theme) => ({
              position: { xs: 'absolute', sm: 'relative', md: 'absolute' },
              gridRowStart: 1,
              gridRowEnd: 2,
              gridColumnStart: { xs: 'unset', sm: 1, md: 'unset' },
              width: '100%',
              justifySelf: { xs: 'center', sm: 'unset' },
              '& > img': {
                objectFit: { xs: 'cover', sm: 'unset' },
                objectPosition: { xs: 'top', sm: 'unset' },
              },
              height: '100%',
              borderRadius: '16px',
              padding: '8px',
              background: `linear-gradient(120deg, ${
                (theme.vars || theme).palette.grey[50]
              } 0%, ${alpha(theme.palette.primary[50], 0.5)} 150%)`,
              border: '1px solid',
              borderColor: (theme.vars || theme).palette.grey[100],
              backfaceVisibility: 'hidden',
              transition: 'all 0.3s ease',
              transform: {
                xs: `rotateY(${heroAppMode ? '0' : '180'}deg)`,
                sm: 'unset',
                md: `rotateY(${heroAppMode ? '0' : '180'}deg)`,
              },
              boxShadow: `0 4px 8px ${alpha(theme.palette.grey[100], 0.9)}`,
            }),
            (theme) =>
              theme.applyDarkStyles({
                background: `linear-gradient(120deg, ${
                  (theme.vars || theme).palette.primaryDark[500]
                } 0%, ${alpha(theme.palette.primaryDark[800], 0.4)} 150%)`,
                borderColor: `${alpha(theme.palette.primaryDark[300], 0.3)}`,
                boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.8)}`,
              }),
          ]}
        >
          <Img
            src={`/static/toolpad/marketing/hero-${fileIndex + 1}.png`}
            width="2880"
            height="1592"
          />
        </Box>
        <CodeBlock appMode={heroAppMode} fileIndex={fileIndex} setFrameIndex={setFrameIndex} />
        <Box
          sx={{
            display: { xs: 'grid', sm: 'none', md: 'grid' },
            gridRowStart: 2,
            gridColumnStart: 1,
            gridColumnEnd: 3,
            transform: { xs: 'scale(0.95)', sm: 'unset' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Code
            </Typography>
            <HeroModeSwitch checked={heroAppMode} onChange={handleModeChange} />
            <Typography variant="caption" color="text.secondary">
              UI
            </Typography>
          </Box>
        </Box>
      </Box>
    </ToolpadHeroContainer>
  );
}

TypingAnimation.propTypes = {
  setWordIndex: PropTypes.func,
  wordIndex: PropTypes.number,
};
