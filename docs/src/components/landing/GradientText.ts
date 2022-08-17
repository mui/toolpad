import { styled } from '@mui/material/styles';

const GradientText = styled('span')(({ sx }) => ({
  background: `linear-gradient(315deg, #0059B3 0%, #007FFF 100%);`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  sx,
}));

export default GradientText;
