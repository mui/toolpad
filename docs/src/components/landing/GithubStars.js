import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function GithubStars() {
  const [fetching, setFetching] = React.useState(true);
  const [stars, setStars] = React.useState(0);
  const theme = useTheme();

  const fetchStars = React.useCallback(async () => {
    setFetching(true);
    const response = await fetch('https://api.github.com/repos/mui/mui-toolpad');
    const data = await response.json();
    setFetching(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mui-toolpad-stars', `${Date.now()}_${data.stargazers_count}`);
    }
    setStars(data.stargazers_count);
  }, []);

  React.useEffect(() => {
    const cached = localStorage.getItem('mui-toolpad-stars');
    if (cached && Date.now() - parseFloat(cached.split('_')[0]) < 1000 * 60 * 60) {
      setStars(parseFloat(cached.split('_')[1]));
      setFetching(false);
    } else {
      fetchStars();
    }
  }, [fetchStars]);

  return (
    <ButtonGroup
      variant="outlined"
      disableElevation
      aria-label="split button"
      sx={{ justifyContent: { xs: 'center', sm: 'start' } }}
    >
      <Button
        size="small"
        component="a"
        sx={{
          color: theme.palette.grey[900],
          borderColor: theme.palette.grey[200],
          borderTopLeftRadius: '8px',
          borderBottomLeftRadius: '8px',
          pointerEvents: 'none',
          cursor: 'default',
          ...theme.applyDarkStyles({
            color: theme.palette.primary[50],
            borderColor: theme.palette.primaryDark[600],
          }),
        }}
        startIcon={<GitHubIcon />}
      >
        Star
      </Button>
      <Tooltip title="Open the GitHub repo">
        <Button
          size="small"
          aria-label="GitHub repository"
          sx={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderTopRightRadius: '8px',
            borderBottomRightRadius: '8px',
            borderColor: theme.palette.grey[200],
            ...theme.applyDarkStyles({
              borderColor: theme.palette.primaryDark[600],
              color: theme.palette.primary[200],
            }),
          }}
          href="https://github.com/mui/mui-toolpad"
          target="_blank"
          rel="noopener nofollow"
          startIcon={<StarRateRoundedIcon fontSize="small" sx={{ mt: -0.25 }} />}
        >
          {fetching ? '...' : stars}
        </Button>
      </Tooltip>
    </ButtonGroup>
  );
}
