import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { styled } from '@mui/material/styles';

const Video = styled('video')(({ theme }) => ({
  borderStyle: 'solid',
  borderColor:
    theme.palette.mode === 'dark' ? theme.palette.primaryDark[900] : theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  objectFit: 'cover',
  width: '100%',
  height: '100%',
}));

const VIDEO_BREAKPOINT_GAP = 100;

const VideoContainer = styled(Box)(({ theme }) => ({
  borderStyle: 'solid',
  maxWidth: 1100,
  height: { xs: 200, sm: 390, md: 445, lg: 615 },
  width: {
    xs: 360,
    sm: theme.breakpoints.values.sm - VIDEO_BREAKPOINT_GAP,
    md: theme.breakpoints.values.md + VIDEO_BREAKPOINT_GAP,
    lg: theme.breakpoints.values.lg + VIDEO_BREAKPOINT_GAP,
  },
  borderColor:
    theme.palette.mode === 'dark' ? theme.palette.primaryDark[400] : theme.palette.grey[300],
  borderRadius: theme.shape.borderRadius,
  borderWidth: '1px',
}));

export default function DemoVideo() {
  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        mt: { xs: theme.spacing(2.5), sm: theme.spacing(7.5) },
        py: { xs: 4, sm: 6 },
        bgcolor: theme.palette.mode === 'dark' ? 'primaryDark.900' : 'grey.50',
      })}
    >
      <Container>
        <VideoContainer>
          <Video
            sx={{
              borderWidth: { xs: '10px', sm: '20px' },
            }}
            muted
            autoPlay
            playsInline
            loop
            poster="/static/toolpad/marketing/index-hero-video-poster.png"
          >
            <source src="/static/toolpad/marketing/index-hero-demo-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </Video>
        </VideoContainer>
      </Container>
    </Box>
  );
}
