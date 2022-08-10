import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Link from 'docs/src/modules/components/Link';
import IconImage from 'docs/src/components/icon/IconImage';
import LaunchRounded from '@mui/icons-material/LaunchRounded';
import GradientText from '../components/landing/GradientText';

const ColumnHead = ({ label, metadata, tooltip, nested = false, href }) => {
  const text = (
    <Typography
      {...(href && {
        component: Link,
        href,
        target: '_blank',
      })}
      variant="body2"
      sx={{
        '&:hover > svg': { color: 'primary.main' },
        ...(href && {
          fontWeight: 500,
          '&:hover > svg': {
            opacity: 1,
            ml: 0.5,
          },
        }),
      }}
    >
      {label}{' '}
      {href ? (
        <LaunchRounded color="primary" sx={{ fontSize: 14, opacity: 0, transition: '0.3s' }} />
      ) : null}
      {tooltip ? (
        <InfoOutlinedIcon
          sx={{ fontSize: 16, verticalAlign: 'middle', ml: 0.5, color: 'text.secondary' }}
        />
      ) : null}
    </Typography>
  );
  return (
    <Box sx={{ pl: nested ? 2.5 : 1, pr: 1, alignSelf: 'center', justifySelf: 'flex-start' }}>
      {tooltip ? (
        <Tooltip title={tooltip} placement="right" describeChild>
          {text}
        </Tooltip>
      ) : (
        text
      )}
      {metadata ? (
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight="normal"
          sx={{ display: 'block' }}
        >
          {metadata}
        </Typography>
      ) : null}
    </Box>
  );
};

ColumnHead.propTypes = {
  href: PropTypes.string,
  label: PropTypes.string.isRequired,
  metadata: PropTypes.string,
  nested: PropTypes.bool,
  tooltip: PropTypes.string,
};

const plans = ['community', 'commercial'];

const Headline = (
  <Typography variant="h2" maxWidth={500} marginBottom={3}>
    Different plan sizes to fit <br />
    <GradientText>every need</GradientText>
  </Typography>
);

const planInfo = {
  community: {
    color: 'green',
    title: 'Community',
    description: 'Only available to self-host. Free forever. Ideal for freelancers.',
  },
  commercial: {
    color: 'blue',
    title: 'Commercial',
    description: 'Paid plan for enterprises.',
  },
};

const rowHeaders = {
  // Hosting
  'Self-hosting': <ColumnHead label="Self-hosting" />,
  'Cloud hosting': <ColumnHead label="Cloud hosting" />,
  // Apps
  'Basic components': <ColumnHead label="Basic components" metadata="Material UI + MUI X Pro" />,
  'Custom components': <ColumnHead label="Custom components" />,
  'Advanced components': <ColumnHead label="Advanced components" metadata="MUI X Premium" />,
  'Version control': <ColumnHead label="Version control" />,
  'Git Sync': <ColumnHead label="Git Sync" />,
  'Import ESM': <ColumnHead label="Import ESM" />,
  'Eject ESM': <ColumnHead label="Eject ESM" />,
  'Custom themes': <ColumnHead label="Custom themes" />,
  'Multiple environments': <ColumnHead label="Multiple environments" />,
  'White label': <ColumnHead label="White label" metadata="Custom domain and branding" />,
  // Users
  'Unlimited applications and users': <ColumnHead label="Unlimited applications and users" />,
  // Data
  'Unlimited REST data sources': <ColumnHead label="Unlimited REST data sources" />,
  // Support
  community: <ColumnHead label="Support level" />,
};

const yes = <IconImage name="yes" title="Included" />;
const no = <IconImage name="no" title="Not included" />;

function Info(props) {
  const { value, metadata } = props;
  return (
    <React.Fragment>
      {typeof value === 'string' ? <Typography variant="body2">{value}</Typography> : value}
      {metadata ? (
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight="normal"
          sx={{ display: 'block', mt: 0.8, textAlign: 'center' }}
        >
          {metadata}
        </Typography>
      ) : null}
    </React.Fragment>
  );
}

Info.propTypes = {
  metadata: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};

const communityData = {
  // Apps
  'Self-hosting': yes,
  'Cloud hosting': no,
  'Basic components': yes,
  'Custom components': yes,
  'Advanced components': no,
  'Version control': no,
  'Git Sync': no,
  'Import ESM': no,
  'Eject ESM': no,
  'Custom themes': no,
  'Multiple environments': no,
  'White label': no,
  // Users
  'Unlimited applications and users': <Info value={yes} metadata="Self-host only" />,
  // Data
  'Unlimited REST data sources': yes,
  // Support
  community: <Info value="Community" />,
};

const commercialData = {
  // Apps
  'Self-hosting': yes,
  'Cloud hosting': yes,
  'Basic components': yes,
  'Custom components': yes,
  'Advanced components': yes,
  'Version control': yes,
  'Git Sync': yes,
  'Import ESM': yes,
  'Eject ESM': yes,
  'Custom themes': yes,
  'Multiple environments': yes,
  'White label': yes,
  // Users
  'Unlimited applications and users': yes,
  // Data
  'Unlimited REST data sources': yes,
  // Support
  community: <Info value="Priority" />,
};

export { Headline, planInfo, plans, rowHeaders, communityData, commercialData };
