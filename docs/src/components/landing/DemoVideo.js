import React, { useRef } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import { styled, alpha } from '@mui/material/styles';

const VideoContainer = styled(Box)(({ theme }) => [
  {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    padding: 8,
    paddingBottom: 4,
    background: `linear-gradient(120deg, ${(theme.vars || theme).palette.primary[50]} 0%, ${alpha(
      theme.palette.primary[100],
      0.2,
    )} 150%)`,
    border: '1px solid',
    borderColor: `${alpha(theme.palette.primary[100], 0.6)}`,
    boxShadow: `4px 0 60px ${alpha(theme.palette.primary[100], 0.8)}`,
    overflow: 'hidden',
  },
  theme.applyDarkStyles({
    background: `linear-gradient(120deg, ${
      (theme.vars || theme).palette.primaryDark[500]
    } 0%, ${alpha(theme.palette.primaryDark[800], 0.4)} 150%)`,
    borderColor: `${alpha(theme.palette.primaryDark[300], 0.3)}`,
    boxShadow: `4px 0 60px ${alpha(theme.palette.primary[600], 0.5)}`,
  }),
]);

const Video = styled('video')(({ theme }) => [
  {
    overflow: 'hidden',
    objectFit: 'cover',
    width: '100%',
    height: '100%',
    borderRadius: 10,
    border: '1px solid',
    borderColor: `${alpha(theme.palette.primary[100], 0.4)}`,
  },
  theme.applyDarkStyles({
    borderColor: (theme.vars || theme).palette.primaryDark[700],
  }),
]);

const PlayButton = styled(IconButton)(({ theme }) => [
  {
    position: 'absolute',
    transform: 'translate(-50%,-50%)',
    background: `linear-gradient(120deg, ${(theme.vars || theme).palette.primary[400]} 0%, ${
      (theme.vars || theme).palette.primary[800]
    } 150%)`,
    borderRadius: 99,
    width: 64,
    height: 64,
    inset: '50%',
    border: 'none',
    boxShadow: `0 8px 20px ${alpha(theme.palette.primary[900], 0.5)}`,
    transition: theme.transitions.create(['scale', 'box-shadow'], {
      duration: theme.transitions.duration.shortest,
    }),
    zIndex: 10,
    '&:hover': {
      scale: '1.05',
      background: `linear-gradient(120deg, ${(theme.vars || theme).palette.primary[500]} 0%, ${
        (theme.vars || theme).palette.primary[800]
      } 150%)`,
      boxShadow: `0 12px 20px ${alpha(theme.palette.primary[900], 0.8)}`,
    },
  },
]);

const PauseButton = styled(IconButton)(({ theme }) => [
  {
    position: 'absolute',
    background: `linear-gradient(120deg, ${(theme.vars || theme).palette.primary[900]} 0%, ${
      (theme.vars || theme).palette.primary[700]
    } 150%)`,
    borderRadius: 99,
    width: 32,
    height: 32,
    bottom: 16,
    left: 16,
    border: 'none',
    boxShadow: `0 4px 8px ${alpha(theme.palette.primary[900], 0.4)}`,
    transition: theme.transitions.create(['scale', 'box-shadow'], {
      duration: theme.transitions.duration.shortest,
    }),
    zIndex: 10,
    '&:hover': {
      scale: '1.05',
      background: `linear-gradient(120deg, ${(theme.vars || theme).palette.primary[800]} 0%, ${
        (theme.vars || theme).palette.primary[600]
      } 150%)`,
      boxShadow: `0 8px 10px ${alpha(theme.palette.primary[900], 0.6)}`,
    },
  },
]);

export default function DemoVideo() {
  const videoRef = useRef();

  const handlePlay = () => {
    videoRef.current.play();
  };
  const handlePause = () => {
    videoRef.current.pause();
  };

  return (
    <VideoContainer>
      <PlayButton type="button" onClick={handlePlay} color="primary">
        <PlayArrowRoundedIcon sx={{ color: '#FFF' }} />
      </PlayButton>
      <PauseButton type="button" onClick={handlePause}>
        <PauseRoundedIcon sx={{ color: '#FFF', fontSize: 16 }} />
      </PauseButton>
      <Video poster="/static/toolpad/marketing/index-hero-video-poster.png" ref={videoRef}>
        <source src="/static/toolpad/marketing/index-hero-demo-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </Video>
    </VideoContainer>
  );
}
