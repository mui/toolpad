import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import ROUTES from '../../route';

export default function GithubStars() {
  const [fetching, setFetching] = React.useState(true);
  const [stars, setStars] = React.useState(0);
  const theme = useTheme();

  const fetchStars = React.useCallback(async () => {
    setFetching(true);
    const response = await fetch('https://api.github.com/repos/mui/mui-toolpad');
    const data = await response.json();
    setFetching(false);
    if (response.status !== 200) {
      console.error('Failed to fetch stars count', data);
    }
    if (typeof window !== 'undefined' && data.stargazers_count) {
      localStorage.setItem('mui-toolpad-stars', `${Date.now()}_${data.stargazers_count}`);
    }
    setStars(data.stargazers_count ?? '');
  }, []);

  React.useEffect(() => {
    const cached = localStorage.getItem('mui-toolpad-stars');
    if (cached && Date.now() - parseFloat(cached.split('_')?.[0]) < 1000 * 60 * 60) {
      setStars(cached.split('_')?.[1] ? parseFloat(cached.split('_')?.[1]) : '');
      setFetching(false);
    } else {
      fetchStars();
    }
  }, [fetchStars]);

  return (
    <Button
      component="a"
      href={ROUTES.toolpadRepo}
      target="_blank"
      rel="noopener nofollow"
      aria-label="split button"
      data-ga-event-category="toolpad_to_github"
      data-ga-event-label="Toolpad GitHub Stars Click"
      data-ga-event-action="stars_click"
      size="small"
      variant="outlined"
      sx={{
        color: theme.palette.grey[900],
        borderColor: theme.palette.grey[200],
        ...theme.applyDarkStyles({
          color: theme.palette.primary[50],
          background: theme.palette.primaryDark[700],
          borderColor: theme.palette.primaryDark[600],
        }),
      }}
      startIcon={<GitHubIcon />}
    >
      Star
      <Box
        sx={{
          display: 'flex',
          alignItem: 'center',
          ml: 0.5,
          color: theme.palette.primary[500],
          ...theme.applyDarkStyles({
            color: theme.palette.primary[200],
          }),
        }}
      >
        <StarBorderOutlinedIcon
          sx={{ mt: stars ? 0.1 : 0, mr: stars ? 0.5 : 0 }}
          fontSize="small"
        />
        {fetching ? <CircularProgress size={16} sx={{ ml: 0.25, mt: 0.1 }} /> : stars}
      </Box>
    </Button>
  );
}
