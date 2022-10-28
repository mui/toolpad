import * as React from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

const Video = styled('video')(({ theme }) => ({
  borderStyle: 'solid',
  borderColor:
    theme.palette.mode === 'dark' ? theme.palette.primaryDark[900] : theme.palette.grey[100],
  borderRadius: '10px ',
  overflow: 'hidden',
  objectFit: 'cover',
  width: '100%',
  height: '100%',
}));

export default function DemoVideo() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        mt: { xs: '20px', sm: '60px' },
        py: { xs: 2, sm: 6 },
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'primaryDark.900' : 'grey.50'),
      }}
    >
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
          borderColor:
            theme.palette.mode === 'dark'
              ? theme.palette.primaryDark[400]
              : theme.palette.grey[300],
          borderRadius: '10px',
          borderWidth: '1px',
        })}
      >
        <Video
          sx={{
            borderWidth: { xs: '10px', sm: '20px' },
          }}
          muted
          autoPlay
          playsInline
          loop
          poster="/static/toolpad/marketing/index-hero-video-poster.jpg"
        >
          <source src="/static/toolpad/marketing/index-hero-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </Video>
      </Box>
    </Box>
  );
}
