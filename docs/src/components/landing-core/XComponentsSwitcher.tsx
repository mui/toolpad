import * as React from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoAwesomeMosaic from '@mui/icons-material/AutoAwesomeMosaic';
import AutoAwesomeMotion from '@mui/icons-material/AutoAwesomeMotion';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { visuallyHidden } from '@mui/utils';
import Highlighter from 'docs/src/components/action/Highlighter';

const SwipeableViews = dynamic(() => import('react-swipeable-views'), { ssr: false });

function ComponentItem({
  // label,
  icon,
  name,
  description,

}: {
  // label: string;
  icon: React.ReactNode;
  name: React.ReactNode;
  description?: React.ReactNode;

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
      </div>
    </Box>
  );
}

export default function XComponentsSwitcher(props: {
  componentIndex: number;
  setComponentIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { componentIndex, setComponentIndex } = props;
  const componentElement = [
    <ComponentItem
      name="Authentication"
      description="Toolpad simplifies setting authentication through authProvider object, hooks and the Login pages. Check out the supported Identity providers."
      // label="A suite of components for selecting dates, times, and ranges."
      icon={<LockOpenIcon />}
    />,
    <ComponentItem
      name="Navigation and layout"
      // label="Fast, feature-rich data table."
      description="The Layout component provides a standard structure for functional apps, including customizable nav bar, header bar and more."
      icon={<AutoAwesomeMosaic />}
    />,
    <ComponentItem
      name="Imperative dialogs"
      description="Native dialogs offer an easy way to setup interactivity in the dashboard application."
      // label="Data visualization graphs, including bar, line, pie, scatter, and more."
      icon={<NotificationsIcon />}
    />,
    <ComponentItem
      name="Notification snackbars"
      description="Snackbars notify users about an action that a system has performed or will perform."
      // label="Data visualization graphs, including bar, line, pie, scatter, and more."
      icon={<NotificationsIcon />}
    />,
    <ComponentItem
      name="Page content"
      description="Various page related assets like breadcrumbs, tabs, title, toolbar and a responsive container can be configured with the Page content component."
      // label="Display hierarchical data, such as a file system navigator."
      icon={<AutoAwesomeMotion />}
    />,
  ];
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
          index={componentIndex}
          resistance
          enableMouseEvents
          onChangeIndex={(index) => setComponentIndex(index)}
        >
          {componentElement.map((element, index) => (
            <Highlighter
              key={index}
              disableBorder
              onClick={() => setComponentIndex(index)}
              selected={componentIndex === index}
              sx={{
                width: '100%',
                transition: '0.3s',
                transform: componentIndex !== index ? 'scale(0.9)' : 'scale(1)',
              }}
            >
              {element}
            </Highlighter>
          ))}
        </SwipeableViews>
      </Box>
      <Stack spacing={1} useFlexGap sx={{ display: { xs: 'none', md: 'flex' }, maxWidth: 500 }}>
        {componentElement.map((element, index) => (
          <Highlighter
            key={index}
            disableBorder
            onClick={() => setComponentIndex(index)}
            selected={componentIndex === index}
          >
            {element}
          </Highlighter>
        ))}
      </Stack>
    </React.Fragment>
  );
}
