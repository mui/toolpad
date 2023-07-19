import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import FullScreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import { styled, alpha } from '@mui/material/styles';

const VideoContainer = styled(Box)(({ theme }) => [
  {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    padding: 12,
    paddingBottom: 4,
    background: `linear-gradient(120deg, ${(theme.vars || theme).palette.primary[50]} 0%, ${alpha(
      theme.palette.primary[100],
      0.2,
    )} 150%)`,
    border: '1px solid',
    borderColor: `${alpha(theme.palette.primary[100], 0.6)}`,
    boxShadow: `4px 0 40px ${alpha(theme.palette.primary[100], 0.8)}`,
    overflow: 'hidden',
    '&:hover .MuiToolpadHero-pauseButton, &:focus .MuiToolpadHero-pauseButton': {
      opacity: 1,
    },
  },
  theme.applyDarkStyles({
    background: `linear-gradient(120deg, ${
      (theme.vars || theme).palette.primaryDark[500]
    } 0%, ${alpha(theme.palette.primaryDark[800], 0.4)} 150%)`,
    borderColor: `${alpha(theme.palette.primaryDark[300], 0.3)}`,
    boxShadow: `4px 0 40px ${alpha(theme.palette.primary[600], 0.5)}`,
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
    borderColor: `${alpha(theme.palette.primary[100], 0.6)}`,
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
    transform: 'translate(-50%,-50%)',
    inset: '50%',
    background: `linear-gradient(120deg, ${(theme.vars || theme).palette.primary[900]} 0%, ${
      (theme.vars || theme).palette.primary[700]
    } 150%)`,
    borderRadius: 99,
    width: 64,
    height: 64,
    border: 'none',
    boxShadow: `0 4px 8px ${alpha(theme.palette.primary[900], 0.4)}`,
    transition: theme.transitions.create(['scale', 'box-shadow', 'opacity'], {
      duration: theme.transitions.duration.shortest,
    }),
    opacity: 0,
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

const videoContolButton = (theme) => ({
  position: 'absolute',
  background: `linear-gradient(120deg, ${(theme.vars || theme).palette.primary[900]} 0%, ${
    (theme.vars || theme).palette.primary[700]
  } 150%)`,
  borderRadius: 99,
  width: 48,
  height: 48,
  border: 'none',
  boxShadow: `0 4px 8px ${alpha(theme.palette.primary[900], 0.4)}`,
  transition: theme.transitions.create(['scale', 'box-shadow', 'opacity'], {
    duration: theme.transitions.duration.shortest,
  }),
  opacity: 1,
  zIndex: 10,
  '&:hover': {
    scale: '1.05',
    background: `linear-gradient(120deg, ${(theme.vars || theme).palette.primary[800]} 0%, ${
      (theme.vars || theme).palette.primary[600]
    } 150%)`,
    boxShadow: `0 8px 10px ${alpha(theme.palette.primary[900], 0.6)}`,
  },
});

const FullScreenButton = styled(IconButton)(({ theme }) => [
  {
    ...videoContolButton(theme),
    bottom: 16,
    right: 16,
  },
]);

const MuteButton = styled(IconButton)(({ theme }) => [
  {
    ...videoContolButton(theme),
    bottom: 16,
    right: 80,
  },
]);

export default function DemoVideo() {
  const videoRef = React.useRef();
  const [isPaused, setIsPaused] = React.useState(true);
  const [isMuted, setIsMuted] = React.useState(false);

  const handlePlay = () => {
    videoRef.current.play();
    setIsPaused(videoRef.current.paused);
  };
  const handlePause = () => {
    videoRef.current.pause();
    setIsPaused(videoRef.current.paused);
  };
  const handleFullScreen = () => {
    videoRef.current.requestFullscreen();
  };

  const handleMuteToggle = () => {
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <VideoContainer>
      {isPaused ? (
        <PlayButton type="button" onClick={handlePlay} color="primary">
          <PlayArrowRoundedIcon sx={{ color: '#FFF' }} />
        </PlayButton>
      ) : null}

      {!isPaused ? (
        <PauseButton className="MuiToolpadHero-pauseButton" type="button" onClick={handlePause}>
          <PauseRoundedIcon sx={{ color: '#FFF' }} />
        </PauseButton>
      ) : null}

      <FullScreenButton type="button" onClick={handleFullScreen} color="primary">
        <FullScreenRoundedIcon sx={{ color: '#FFF', fontSize: 24 }} />
      </FullScreenButton>

      <MuteButton type="button" onClick={handleMuteToggle} color="primary">
        {isMuted ? (
          <VolumeOffRoundedIcon sx={{ color: '#FFF', fontSize: 24 }} />
        ) : (
          <VolumeUpRoundedIcon sx={{ color: '#FFF', fontSize: 24 }} />
        )}
      </MuteButton>

      <Video poster="/static/toolpad/marketing/index-hero-video-poster.png" ref={videoRef}>
        <source src="/static/toolpad/marketing/index-hero-demo-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </Video>
    </VideoContainer>
  );
}
