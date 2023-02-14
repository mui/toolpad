import * as React from 'react';
import { Box, Button, Link, styled, SxProps, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import { useParams } from 'react-router-dom';
import { DOCUMENTATION_INSTALLATION_URL, ROADMAP_URL, SCHEDULE_DEMO_URL } from '../../constants';
import {
  addUTMParamsToUrl,
  DEMO_CAMPAIGN_NAME,
  sendRoadmapClickEvent,
  sendScheduleDemoClickEvent,
  sendSelfHostClickEvent,
} from '../../utils/ga';

const DemoBarContainer = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.palette.primaryDark[50],
  color: theme.palette.grey[700],
  display: 'flex',
  height: 60,
  justifyContent: 'space-between',
  paddingLeft: 20,
  paddingRight: 20,
}));

const addDemoBarUTMParamsToURL = (url: string): string =>
  addUTMParamsToUrl(url, {
    source: 'demo_bar',
    medium: 'organic_toolpad',
    campaign: DEMO_CAMPAIGN_NAME,
  });

export default function DemoBar() {
  const { appId } = useParams();

  const theme = useTheme();

  const handleSelfHostLinkClick = React.useCallback(() => {
    sendSelfHostClickEvent(appId, 'demoBar');
  }, [appId]);

  const handleRoadmapLinkClick = React.useCallback(() => {
    sendRoadmapClickEvent(appId);
  }, [appId]);

  const handleScheduleDemoClick = React.useCallback(() => {
    sendScheduleDemoClickEvent(appId);
  }, [appId]);

  const linkStyles: SxProps = {
    color: theme.palette.grey[700],
    fontWeight: 'normal',
    textDecorationColor: theme.palette.grey[700],
    '&:hover': { color: theme.palette.grey[700] },
  };

  return (
    <DemoBarContainer>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        Demo version
      </Typography>
      <Typography variant="body2" textAlign="center">
        Check out our{' '}
        <Link
          href={ROADMAP_URL}
          target="_blank"
          underline="always"
          sx={linkStyles}
          onClick={handleRoadmapLinkClick}
        >
          roadmap
        </Link>{' '}
        to stay up to date, or{' '}
        <Link
          href={SCHEDULE_DEMO_URL}
          target="_blank"
          underline="always"
          sx={linkStyles}
          onClick={handleScheduleDemoClick}
        >
          schedule a demo
        </Link>
        .<br />
        Note: PostgreSQL, Google Sheets are supported in the self-hosted version.
      </Typography>
      <Link
        href={addDemoBarUTMParamsToURL(DOCUMENTATION_INSTALLATION_URL)}
        target="_blank"
        onClick={handleSelfHostLinkClick}
      >
        <Button size="medium" variant="contained" endIcon={<KeyboardArrowRightRounded />}>
          Self-host
        </Button>
      </Link>
    </DemoBarContainer>
  );
}
