import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Section from 'docs/src/layouts/Section';
import SectionHeadline from 'docs/src/components/typography/SectionHeadline';
import GradientText from 'docs/src/components/typography/GradientText';
import XComponentsSwitcher from './XComponentsSwitcher';
import ToolpadDialogDemo from './ToolpadDialogDemo';
import ToolpadDashboardLayout from './ToolpadDashboardLayout';
import XChartsDemo from './XChartDemo';
import ToolpadNotificationDemo from './ToolpadNotificationDemo';

export default function ToolpadComponents() {
  const [componentIndex, setComponentIndex] = React.useState(0);
  return (
    <Section bg="gradient">
      <Grid container spacing={2}>
        <Grid md={6}>
          <SectionHeadline
            overline="Features"
            title={
              <Typography variant="h2">
                Fullstack <GradientText> dashboard </GradientText> components
              </Typography>
            }
            description="Quickly build admin dashboard interfaces with a set of components that are designed to work together."
          />
          <XComponentsSwitcher
            componentIndex={componentIndex}
            setComponentIndex={setComponentIndex}
          />
        </Grid>
        <Grid
          xs={12}
          md={6}
          sx={componentIndex === 0 ? { minHeight: { xs: 'auto', sm: 757, md: 'unset' } } : {}}
        >
          <React.Fragment>
            {componentIndex === 0 && <XChartsDemo />}
            {componentIndex === 1 && <ToolpadDashboardLayout />}
            {componentIndex === 2 && <ToolpadDialogDemo />}
            {componentIndex === 3 && <ToolpadNotificationDemo />}
          </React.Fragment>
        </Grid>
      </Grid>
    </Section>
  );
}
