import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Section from 'docs/src/layouts/Section';
import SectionHeadline from 'docs/src/components/typography/SectionHeadline';
import GradientText from 'docs/src/components/typography/GradientText';
import ToolpadFeaturesSwitcher from './ToolpadFeaturesSwitcher';
import ToolpadDialogDemo from './ToolpadDialogDemo';
import ToolpadDashboardLayout from './ToolpadDashboardLayout';
import ToolpadNotificationDemo from './ToolpadNotificationDemo';
import ToolpadPageContainerDemo from './ToolpadPageContainerDemo';

export default function ToolpadComponents() {
  const [tab, setTab] = React.useState('navigation');
  return (
    <Section bg="gradient">
      <Grid container spacing={2}>
        <Grid size={{ md: 6 }}>
          <SectionHeadline
            overline="Features"
            title={
              <Typography variant="h2">
                Fullstack <GradientText> dashboard </GradientText> components
              </Typography>
            }
            description="Quickly build admin dashboard interfaces with a set of components that are designed to work together."
          />
          <ToolpadFeaturesSwitcher tab={tab} setTab={setTab} />
        </Grid>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={tab === 'navigation' ? { minHeight: { xs: 'auto', sm: 757, md: 'unset' } } : {}}
        >
          <React.Fragment>
            {tab === 'navigation' && <ToolpadDashboardLayout />}
            {tab === 'auth' && <div>To Do</div>}
            {tab === 'dialogs' && <ToolpadDialogDemo />}
            {tab === 'notifications' && <ToolpadNotificationDemo />}
            {tab === 'page' && <ToolpadPageContainerDemo />}
          </React.Fragment>
        </Grid>
      </Grid>
    </Section>
  );
}
