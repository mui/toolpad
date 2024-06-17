import * as React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import GradientText from 'docs/src/components/typography/GradientText';
import Highlighter from 'docs/src/components/action/Highlighter';
import Card from '@mui/material/Card';
import { alpha } from '@mui/material/styles';
import Section from 'docs/src/layouts/Section';
import SectionHeadline from 'docs/src/components/typography/SectionHeadline';
import Item, { Group } from 'docs/src/components/action/Item';
import DataObjectIcon from '@mui/icons-material/DataObject';
import AutoAwesomeMosaic from '@mui/icons-material/AutoAwesomeMosaic';
import AutoAwesomeMotion from '@mui/icons-material/AutoAwesomeMotion';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LockOpenIcon from '@mui/icons-material/LockOpen';

export default function Features() {
  const [index, setIndex] = React.useState(0);
  function getSelectedProps(i) {
    return {
      selected: index === i,
      sx: { '& svg': { opacity: index === i ? 1 : 0.5 } },
    };
  }
  return (
    <Section>
      <Grid container spacing={2}>
        <Grid item md={6} sx={{ minWidth: 0 }}>
          <SectionHeadline
            overline="Framework"
            title={
              <Typography variant="h2">
                {' '}
                Fullstack <GradientText> Higher UI primitives </GradientText> and a data first
                design
              </Typography>
            }
            description="Quickly build admin interfaces, CRUD apps, and more with a set of higher-level components. Toolpad is designed to be a data-first framework, with a focus on making it easy to interact with your APIs."
          />
          <Group sx={{ m: -2, p: 2 }}>
            <Highlighter disableBorder {...getSelectedProps(0)} onClick={() => setIndex(0)}>
              <Item
                icon={<DataObjectIcon />}
                title="Data Providers"
                description="Toolpad interacts with your APIs through a data provider object. The data provider exposes a standardized and predefined interface for supported data sources."
              />
            </Highlighter>
            <Highlighter disableBorder {...getSelectedProps(1)} onClick={() => setIndex(1)}>
              <Item
                icon={<AutoAwesomeMosaic />}
                title="Navigation and layout"
                description="The Layout component provides a standard structure for functional apps, including customizable nav bar, header bar and more."
              />
            </Highlighter>
            <Highlighter disableBorder {...getSelectedProps(2)} onClick={() => setIndex(2)}>
              <Item
                icon={<AutoAwesomeMotion />}
                title="CRUD Pages"
                description="Pre-built CRUD page UX offers add, show, update and delete record functionality through a single line of code."
              />
            </Highlighter>
            <Highlighter disableBorder {...getSelectedProps(3)} onClick={() => setIndex(3)}>
              <Item
                icon={<LockOpenIcon />}
                title="Authentication"
                description="Toolpad simplifies setting authentication through authProvider object, hooks and the Login pages. Check out the supported Identity providers."
              />
            </Highlighter>
            <Highlighter disableBorder {...getSelectedProps(4)} onClick={() => setIndex(4)}>
              <Item
                icon={<NotificationsIcon />}
                title="Notification and dialogs"
                description="Toolpad enhances the end user experience by offering native dialogs and notifications support."
              />
            </Highlighter>
          </Group>
        </Grid>
        <Grid xs={12} md={6}>
          <Card
            variant="outlined"
            // {...props}
            sx={[
              (theme) => ({
                p: 2,
                minHeight: 800,
                display: 'flex',
                flexWrap: 'wrap',
                zIndex: 1,
                boxShadow: `0px 4px 8px ${alpha(theme.palette.grey[200], 0.6)}`,
                ...theme.applyDarkStyles({
                  bgcolor: 'primaryDark.900',
                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
                }),
              }),
              // ...(Array.isArray(sx) ? sx : [sx]),
            ]}
          />
        </Grid>
      </Grid>
    </Section>
  );
}
