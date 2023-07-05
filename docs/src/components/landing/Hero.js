import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import SvgMuiLogo from 'docs/src/icons/SvgMuiLogomark';
import IconImage from 'docs/src/components/icon/IconImage';
import GradientText from 'docs/src/components/typography/GradientText';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import GetStartedButtons from 'docs/src/components/home/GetStartedButtons';
import DemoVideo from './DemoVideo';
import ROUTES from '../../route';
import ToolpadHeroContainer from '../../layouts/ToolpadHeroContainer';

function TypingAnimation() {
  const words = ['APIs', 'scripts', 'SQL'];
  const [text, setText] = useState('');
  const [fullText, setFullText] = useState(words[0]);
  const [index, setIndex] = useState(0);

  const l = words.length;
  React.useEffect(() => {
    if (index < fullText.length) {
      setTimeout(() => {
        setText(text + fullText[index]);
        setIndex(index + 1);
      }, 100);
    } else {
      setTimeout(() => {
        setFullText(words[Math.floor(Math.random() * l)]);
        setText('');
        setIndex(0);
      }, 2000);
    }
  });

  return <span>{text}</span>;
}

export default function Hero() {
  return (
    <ToolpadHeroContainer>
      <Box>
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
        <Typography color="text.secondary" sx={{ maxWidth: 520, mb: 2 }}>
          Build scalable and secure internal tools locally. Use your own IDE, drag and drop
          pre-built components or create your own.
        </Typography>
        <GetStartedButtons installation={'npx create-toolpad-app'} to={ROUTES.toolpadQuickstart} />
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            gap: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SvgMuiLogo width={20} />
            <Typography color="text.secondary" fontWeight="medium" variant="body2">
              Powered by MUI
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DataObjectRoundedIcon color="primary" />
            <Typography color="text.secondary" fontWeight="medium" variant="body2">
              Open source
            </Typography>
          </Box>
        </Box>
      </Box>
      <DemoVideo />
    </ToolpadHeroContainer>
  );
}
