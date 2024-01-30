import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import FullScreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import { styled, alpha } from '@mui/material/styles';

const VideoContainer = styled('div')(({ theme }) => [
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
    background: `linear-gradient(120deg, ${alpha(theme.palette.primary[700], 0.5)} 0%, ${alpha(
      theme.palette.primary[800],
      0.4,
    )} 150%)`,
    borderColor: `${alpha(theme.palette.primary[300], 0.3)}`,
    boxShadow: `4px 0 40px ${alpha(theme.palette.primary[600], 0.5)}`,
  }),
]);

const Video = styled('video')(({ theme }) => [
  {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    borderRadius: 10,
    border: '1px solid',
    borderColor: `${alpha(theme.palette.primary[100], 0.6)}`,
  },
  theme.applyDarkStyles({
    borderColor: `${alpha(theme.palette.primary[700], 0.5)}`,
  }),
]);

const videoMainControls = (theme) => ({
  position: 'absolute',
  transform: 'translate(-50%,-50%)',
  background: `linear-gradient(120deg, ${(theme.vars || theme).palette.primary[400]} 0%, ${
    (theme.vars || theme).palette.primary[600]
  } 150%)`,
  borderRadius: 99,
  width: 58,
  height: 58,
  inset: '50%',
  border: 'none',
  boxShadow: `0 4px 8px ${alpha(theme.palette.primary[900], 0.5)}`,
  transition: theme.transitions.create(['scale', 'box-shadow', 'opacity'], {
    duration: theme.transitions.duration.shortest,
  }),
  zIndex: 10,
  '&:hover': {
    scale: '1.02',
    background: `linear-gradient(120deg, ${(theme.vars || theme).palette.primary[500]} 0%, ${
      (theme.vars || theme).palette.primary[700]
    } 150%)`,
    boxShadow: `0 8px 16px ${alpha(theme.palette.primary[900], 0.5)}`,
  },
});

const videoSecondaryControls = (theme) => ({
  position: 'absolute',
  width: 34,
  height: 34,
  background: (theme.vars || theme).palette.primary[50],
  borderRadius: 99,
  border: '1px solid',
  borderColor: (theme.vars || theme).palette.primary[200],
  boxShadow: `0 4px 6px ${alpha(theme.palette.grey[400], 0.2)}`,
  transition: theme.transitions.create(['scale', 'box-shadow', 'opacity'], {
    duration: theme.transitions.duration.shortest,
  }),
  opacity: 1,
  zIndex: 10,
  '&:hover': {
    scale: '1.03',
    borderColor: (theme.vars || theme).palette.primary[300],
    boxShadow: `0 4px 8px ${alpha(theme.palette.grey[500], 0.4)}`,
    background: `linear-gradient(120deg, ${(theme.vars || theme).palette.primary[50]} 0%, ${
      (theme.vars || theme).palette.primary[100]
    } 150%)`,
  },
  ...theme.applyDarkStyles({
    borderColor: (theme.vars || theme).palette.primary[200],
  }),
});

const PlayButton = styled(IconButton)(({ theme }) => [
  {
    ...videoMainControls(theme),
  },
]);

const PauseButton = styled(IconButton)(({ theme }) => [
  {
    ...videoMainControls(theme),
    opacity: 0,
  },
]);

const FullScreenButton = styled(IconButton)(({ theme }) => [
  {
    ...videoSecondaryControls(theme),
    bottom: 28,
    right: 28,
  },
]);

const MuteButton = styled(IconButton)(({ theme }) => [
  {
    ...videoSecondaryControls(theme),
    bottom: 28,
    right: 72,
  },
]);

export default function DemoVideo() {
  const videoRef = React.useRef();
  const [isPaused, setIsPaused] = React.useState(true);
  const [isMuted, setIsMuted] = React.useState(false);

  const handlePlay = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'toolpad_video', {
        event_label: 'Video Start',
        event_category: 'toolpad_landing',
      });
    }
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

  const milestonesComplete = React.useRef(new Set([]));

  const handleTimeUpdate = () => {
    if (typeof window === 'undefined' || !window.gtag || !videoRef.current) {
      return;
    }
    const videoElement = videoRef.current;

    const videoProgress = (videoElement.currentTime / videoElement.duration) * 100;

    const milestones = [25, 50, 75, 100];

    for (const milestone of milestones) {
      if (videoProgress >= milestone && !milestonesComplete.current.has(milestone)) {
        window.gtag('event', 'toolpad_video', {
          event_category: 'toolpad_landing',
          event_label: `video_progress_${milestone}`,
        });
        milestonesComplete.current.add(milestone);
        if (milestone === 100) {
          milestonesComplete.current.clear();
        }
      }
    }
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
        <FullScreenRoundedIcon color="primary" sx={{ fontSize: 24 }} />
      </FullScreenButton>

      <MuteButton type="button" onClick={handleMuteToggle} color="primary">
        {isMuted ? (
          <VolumeOffRoundedIcon color="primary" sx={{ fontSize: 24 }} />
        ) : (
          <VolumeUpRoundedIcon color="primary" sx={{ fontSize: 24 }} />
        )}
      </MuteButton>

      <Video
        poster="/static/toolpad/marketing/index-hero-video-poster.png"
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
      >
        <source src="/static/toolpad/marketing/index-hero-demo-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </Video>
    </VideoContainer>
  );
}
