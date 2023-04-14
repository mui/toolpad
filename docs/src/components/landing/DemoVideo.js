import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { styled, alpha } from '@mui/material/styles';

const Video = styled('video')(({ theme }) => ({
  overflow: 'hidden',
  objectFit: 'cover',
  width: '100%',
  height: '100%',
  borderRadius: '5px',
  border: '1px solid',
  borderColor:
    theme.palette.mode === 'dark'
      ? `${theme.palette.primaryDark[700]}`
      : `${theme.palette.primary[100]}`,
}));

const VIDEO_BREAKPOINT_GAP = 100;

const VideoContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1100,
  height: '100%',
  width: {
    xs: 360,
    sm: theme.breakpoints.values.sm - VIDEO_BREAKPOINT_GAP,
    md: theme.breakpoints.values.md + VIDEO_BREAKPOINT_GAP,
    lg: theme.breakpoints.values.lg + VIDEO_BREAKPOINT_GAP,
  },
  borderRadius: theme.shape.borderRadius,
  padding: 16,
  background:
    theme.palette.mode === 'dark'
      ? `linear-gradient(230deg, ${theme.palette.primaryDark[600]} 0%, ${alpha(
          theme.palette.primaryDark[700],
          0.4,
        )} 150%)`
      : `linear-gradient(230deg, ${theme.palette.primary[50]} 0%, ${alpha(
          theme.palette.primary[100],
          0.4,
        )} 150%)`,
  border: '1px solid',
  borderColor:
    theme.palette.mode === 'dark'
      ? `${alpha(theme.palette.primaryDark[300], 0.5)}`
      : `${alpha(theme.palette.primary[200], 0.5)}`,
  boxShadow:
    theme.palette.mode === 'dark'
      ? `4px 0 60px ${alpha(theme.palette.primary[300], 0.5)}`
      : `4px 0 60px ${alpha(theme.palette.primary[100], 0.8)}`,
}));

export default function DemoVideo() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        py: { xs: 4, sm: 8 },
      }}
    >
      <Container>
        <VideoContainer>
          <Video
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
