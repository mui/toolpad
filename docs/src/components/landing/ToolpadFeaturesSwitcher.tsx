import * as React from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from '@mui/docs/Link';
import AutoAwesomeMosaic from '@mui/icons-material/AutoAwesomeMosaic';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import AutoAwesomeMotion from '@mui/icons-material/AutoAwesomeMotion';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import Highlighter from 'docs/src/components/action/Highlighter';

const SwipeableViews = dynamic(() => import('react-swipeable-views'), { ssr: false });

function ComponentItem({
  // label,
  icon,
  name,
  description,
  link,
}: {
  // label: string;
  icon: React.ReactNode;
  name: React.ReactNode;
  description?: React.ReactNode;
  link?: React.ReactNode;
}) {
  return (
    <Box
      component="span"
      sx={{
        flexGrow: 1,
        display: 'flex',
        p: 2,
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { md: 'center' },
        gap: 2.5,
      }}
    >
      {icon}
      <div>
        <Typography
          component="span"
          color="text.primary"
          variant="body2"
          fontWeight="bold"
          display="block"
        >
          {name}
        </Typography>
        {description && (
          <Typography
            component="span"
            color="text.secondary"
            variant="body2"
            fontWeight="regular"
            display="block"
            gutterBottom
          >
            {description}
          </Typography>
        )}
        {link && (
          <Link href={link.toString()} underline="hover" variant="body2">
            View the docs
            <KeyboardArrowRightRounded fontSize="small" />
          </Link>
        )}
      </div>
    </Box>
  );
}

const componentElement = new Map([
  [
    'navigation',
    {
      name: 'Navigation and layout',
      description:
        'The Layout component provides a standard structure for functional apps, including customizable nav bar, header bar and more.',
      icon: <AutoAwesomeMosaic />,
      link: '/toolpad/core/react-dashboard-layout/',
    },
  ],
  [
    'auth',
    {
      name: 'Authentication',
      description:
        'Our authentication components help you set up complex authentication flows quickly, without subscription costs.',
      icon: <LockOpenIcon />,
      link: '/toolpad/core/react-sign-in-page/',
    },
  ],
  [
    'page',
    {
      name: 'Page container',
      description: 'Sets up breadcrumbs, title, toolbar and a responsive container for your pages.',
      icon: <AutoAwesomeMotion />,
      link: '/toolpad/core/react-page-container/',
    },
  ],
  [
    'dialogs',
    {
      name: 'Dialogs',
      description:
        'Toolpad Core exports an imperative API to manage dialogs in your application. System dialogs that adapt to your application theme are also included.',
      icon: <NotificationsIcon />,
      link: '/toolpad/core/react-use-dialogs/',
    },
  ],
  [
    'notifications',
    {
      name: 'Notifications',
      description:
        'We offer imperative APIs to deal with snackbars an notifications around your application.',
      icon: <NotificationsIcon />,
      link: '/toolpad/core/react-use-notifications/',
    },
  ],
]);

export default function ToolpadFeaturesSwitcher(props: {
  tab: string;
  setTab: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { tab, setTab } = props;
  const tabIndex = React.useMemo(() => Array.from(componentElement.keys()).indexOf(tab), [tab]);
  return (
    <React.Fragment>
      <Box
        sx={{
          display: { md: 'none' },
          maxWidth: 'calc(100vw - 40px)',
          '& > div': { pr: '32%' },
        }}
      >
        <SwipeableViews
          index={tabIndex}
          resistance
          enableMouseEvents
          onChangeIndex={(index) => setTab(Array.from(componentElement.keys())[index])}
        >
          {Array.from(componentElement.entries(), ([key, element]) => (
            <Highlighter
              key={key}
              disableBorder
              onClick={() => setTab(key)}
              selected={tab === key}
              sx={{
                width: '100%',
                transition: '0.3s',
                transform: tab !== key ? 'scale(0.9)' : 'scale(1)',
              }}
            >
              <ComponentItem {...element} />
            </Highlighter>
          ))}
        </SwipeableViews>
      </Box>
      <Stack spacing={1} useFlexGap sx={{ display: { xs: 'none', md: 'flex' }, maxWidth: 500 }}>
        {Array.from(componentElement.entries(), ([key, element]) => (
          <Highlighter key={key} disableBorder onClick={() => setTab(key)} selected={tab === key}>
            <ComponentItem {...element} />
          </Highlighter>
        ))}
      </Stack>
    </React.Fragment>
  );
}
