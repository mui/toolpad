import * as React from 'react';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import IntegrationInstructionsRoundedIcon from '@mui/icons-material/IntegrationInstructionsRounded';
import LinkIcon from '@mui/icons-material/Link';
import ToggleOnRoundedIcon from '@mui/icons-material/ToggleOnRounded';
import GppGoodIcon from '@mui/icons-material/GppGood';
import FormatColorFillRoundedIcon from '@mui/icons-material/FormatColorFillRounded';
import Typography from '@mui/material/Typography';
import GradientText from 'docs/src/components/typography/GradientText';

const features = {
  overline: 'Features',
  Headline: (
    <Typography variant="h2" maxWidth={500} marginBottom={3}>
      <GradientText>Production-ready</GradientText>
      <br />
      in minutes
    </Typography>
  ),
  cards: [
    {
      icon: <BuildRoundedIcon fontSize="small" color="primary" />,
      title: 'Build visually',
      wip: false,
      description:
        'Use the drag & drop canvas to build applications fast. Create a beautiful, functional user interface without writing a single line of CSS.',
    },
    {
      icon: <IntegrationInstructionsRoundedIcon fontSize="small" color="primary" />,
      title: 'Use your IDE',
      wip: false,
      description:
        'Build low-code with pro-code extensibility. Use your IDE to write code and bring data to the canvas.',
    },
    {
      icon: <LinkIcon fontSize="small" color="primary" />,
      title: 'Connect any data source',
      wip: false,
      description:
        'No need for integrations — use your existing code to connect to your data sources, from databases to APIs.',
    },
    {
      icon: <ToggleOnRoundedIcon fontSize="small" color="primary" />,
      title: 'MUI component libraries',
      wip: true,
      description:
        'Access the full suite of pre-built MUI components, including both Material UI and MUI X—or bring your own custom components to your Toolpad Studio app.',
    },
    {
      icon: <GppGoodIcon fontSize="small" color="primary" />,
      title: 'Self-host for security',
      wip: false,
      description:
        'Host Toolpad Studio on your own infrastructure to keep full control over where your data goes. In the future, we will provide airgapping guarantees.',
    },
    {
      icon: <FormatColorFillRoundedIcon fontSize="small" color="primary" />,
      title: 'Custom theming',
      wip: true,
      description:
        "Write CSS in Toolpad Studio to manage the finer details. Import styles or define them locally to take full control of your app's theme.",
    },
  ],
};

export default features;
