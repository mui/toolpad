import * as React from 'react';
import { styled } from '@mui/material/styles';

const Video = styled('video')(({ theme }) => ({
  borderStyle: 'solid',
  borderColor:
    theme.palette.mode === 'dark' ? theme.palette.primaryDark[900] : theme.palette.grey[100],
  borderRadius: '10px 10px 0 0 ',
  overflow: 'hidden',
  objectFit: 'cover',
  objectPosition: 'top',
  outline: `1px solid ${
    theme.palette.mode === 'dark' ? theme.palette.primaryDark[400] : theme.palette.grey[300]
  }`,
}));

export default function DemoVideo() {
  return (
    <Video
      sx={{ height: { sm: 600 }, borderWidth: { xs: '10px 10px 0 10px', sm: '20px 20px 0 20px' } }}
      playsInline
      autoPlay
      muted
      loop
      poster="/static/toolpad/marketing/hero-screenshot.svg"
    >
      <source src="/static/toolpad/marketing/hero-video.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </Video>
  );
}
