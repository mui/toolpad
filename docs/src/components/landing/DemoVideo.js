import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { styled, alpha } from '@mui/material/styles';

const Video = styled('video')(({ theme }) => [
  {
    overflow: 'hidden',
    objectFit: 'cover',
    width: '100%',
    height: '100%',
    borderRadius: 6,
    border: '1px solid',
    borderColor: (theme.vars || theme).palette.primary[100],
  },
  theme.applyDarkStyles({
    borderColor: (theme.vars || theme).palette.primaryDark[700],
  }),
]);

const VideoContainer = styled(Box)(({ theme }) => [
  {
    width: '100%',
    height: '100%',
    borderRadius: theme.shape.borderRadius,
    padding: 12,
    background: `linear-gradient(230deg, ${theme.palette.primary[50]} 0%, ${alpha(
      theme.palette.primary[100],
      0.2,
    )} 150%)`,
    border: '1px solid',
    borderColor: `${alpha(theme.palette.primary[200], 0.5)}`,
    boxShadow: `4px 0 60px ${alpha(theme.palette.primary[100], 0.8)}`,
  },
  theme.applyDarkStyles({
    background: `linear-gradient(230deg, ${theme.palette.primaryDark[600]} 0%, ${alpha(
      theme.palette.primaryDark[700],
      0.4,
    )} 150%)`,
    borderColor: `${alpha(theme.palette.primaryDark[300], 0.5)}`,
    boxShadow: `4px 0 60px ${alpha(theme.palette.primary[300], 0.5)}`,
  }),
]);

export default function DemoVideo() {
  return (
    <Container
      sx={{
        py: { xs: 2, sm: 4, md: 6 },
        scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        <VideoContainer>
          <Video
            playsInline
            controls
            poster="/static/toolpad/marketing/index-hero-video-poster.png"
          >
            <source src="/static/toolpad/marketing/index-hero-demo-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </Video>
        </VideoContainer>
      </Box>
    </Container>
  );
}
