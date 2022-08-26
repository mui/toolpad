import * as React from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

const Video = styled('video')(({ theme }) => ({
  borderStyle: 'solid',
  borderColor:
    theme.palette.mode === 'dark' ? theme.palette.primaryDark[900] : theme.palette.grey[100],
  borderRadius: '10px 10px 0 0 ',
  overflow: 'hidden',
  objectFit: 'cover',
  width: '100%',
  height: '100%',
}));

export default function DemoVideo() {
  return (
    <Box
      sx={(theme) => ({
        borderStyle: 'solid',
        maxWidth: 1100,
        height: { xs: 200, sm: 390, md: 445, lg: 615 },
        width: {
          xs: 360,
          sm: theme.breakpoints.values.sm + 100,
          md: theme.breakpoints.values.md - 100,
          lg: theme.breakpoints.values.lg - 100,
        },
        borderColor: `${
          theme.palette.mode === 'dark' ? theme.palette.primaryDark[400] : theme.palette.grey[300]
        }`,
        borderRadius: '10px 10px 0 0',
        borderWidth: '1px 1px 0 1px',
      })}
    >
      <Video
        sx={{
          borderWidth: { xs: '10px 10px 0 10px', sm: '20px 20px 0 20px' },
        }}
        muted
        autoPlay
        playsInline
        loop
        poster={'/static/toolpad/marketing/hero-screenshot.png'}
      >
        <source src="/static/toolpad/marketing/hero-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </Video>
    </Box>
  );
}
