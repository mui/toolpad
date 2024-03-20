import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Link from 'docs/src/modules/components/Link';
import IconImage from 'docs/src/components/icon/IconImage';
import LaunchRounded from '@mui/icons-material/LaunchRounded';
import GradientText from 'docs/src/components/typography/GradientText';

function ColumnHead({ label, metadata, tooltip, nested = false, href }) {
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
        <LaunchRounded
          color="primary"
          sx={{ fontSize: 14, opacity: 0, transition: '0.3s' }}
        />
      ) : null}
      {tooltip ? (
        <InfoOutlinedIcon
          sx={{
            fontSize: 16,
            verticalAlign: 'middle',
            ml: 0.5,
            color: 'text.secondary',
          }}
        />
      ) : null}
    </Typography>
  );
  return (
    <Box
      sx={{
        pl: nested ? 2.5 : 1,
        pr: 1,
        alignSelf: 'center',
        justifySelf: 'flex-start',
      }}
    >
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
}

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
    description:
      'Get started with a powerful open-source low-code platform, MIT-licensed, free forever',
  },
  commercial: {
    color: 'blue',
    title: 'Commercial',
    description:
      'Paid plans for large teams and organizations with advanced security, control, and support needs',
  },
};

const rowHeaders = {
  // Hosting
  'Self-hosting': <ColumnHead label="Self-hosting" />,
  'Cloud hosting': <ColumnHead label="Cloud hosting" />,
  // Apps
  Apps: <ColumnHead label="Apps" />,
  'Data sources': <ColumnHead label="Data sources" />,
  'Export to code': <ColumnHead label="Export to code" />,
  'Plugin API': (
    <ColumnHead
      label="Plugin API"
      tooltip={'Extend the platform with community extensions.'}
    />
  ),
  'Staging environments': <ColumnHead label="Staging environments" />,
  'White label': (
    <ColumnHead label="White label" tooltip={'Custom domain and branding'} />
  ),
  'Custom themes': <ColumnHead label="Custom themes" />,
  // Components
  Components: <ColumnHead label="Components" tooltip={'Material UI components'} />,
  'Custom components': (
    <ColumnHead
      label="Custom components"
      tooltip={'Extend the platform with custom React components.'}
    />
  ),
  'Premium components': (
    <ColumnHead label="Premium components" tooltip={'MUI X Premium'} />
  ),
  // Security
  'OAuth2/OpenID SSO': <ColumnHead label="OAuth2/OpenID SSO" />,
  'SSO enforcement': <ColumnHead label="SSO enforcement" />,
  'SAML-based SSO': (
    <ColumnHead
      label="SAML-based SSO"
      tooltip={'Integrate with Okta, Active Directory, or any other SAML providers'}
    />
  ),
  'Granular permissions': (
    <ColumnHead
      label="Granular permissions"
      tooltip={
        'Finer permissions for granular control over the access to folders and resources (queries, apps, secrets, etc),'
      }
    />
  ),
  'Audit logs': (
    <ColumnHead
      label="Audit logs"
      tooltip={
        'Track every query run against your databases and APIs, as well as user actions.'
      }
    />
  ),
  // Support
  'Support level': <ColumnHead label="Support level" />,
};

const yes = <IconImage name="pricing/yes" title="Included" />;
const pending = <IconImage name="pricing/time" title="Work in progress" />;
const no = <IconImage name="pricing/no" title="Not included" />;

function Info(props) {
  const { value, metadata } = props;
  return (
    <React.Fragment>
      {typeof value === 'string' ? (
        <Typography variant="body2">{value}</Typography>
      ) : (
        value
      )}
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
  // Hosting
  'Self-hosting': yes,
  'Cloud hosting': no,
  // Apps
  Apps: <Info value={'Unlimited'} />,
  'Data sources': <Info value={'Unlimited'} />,
  'Export to code': pending,
  'Plugin API': pending,
  'Staging environments': <Info value={pending} metadata={'1 env'} />,
  'White label': no,
  'Custom themes': no,
  // Components
  Components: yes,
  'Custom components': yes,
  'Premium components': no,
  // Security
  'OAuth2/OpenID SSO': pending,
  'SSO enforcement': no,
  'SAML-based SSO': no,
  'Granular permissions': no,
  'Audit logs': no,
  // Support
  'Support level': <Info value={yes} metadata={'Community'} />,
};

const commercialData = {
  // Hosting
  'Self-hosting': pending,
  'Cloud hosting': pending,
  // Apps
  Apps: <Info value={'Unlimited'} />,
  'Data sources': <Info value={'Unlimited'} />,
  'Export to code': pending,
  'Plugin API': pending,
  'Staging environments': <Info value={pending} metadata={'Unlimited'} />,
  'White label': pending,
  'Custom themes': pending,
  // Components
  Components: pending,
  'Custom components': pending,
  'Premium components': pending,
  // Security
  'OAuth2/OpenID SSO': pending,
  'SSO enforcement': pending,
  'SAML-based SSO': pending,
  'Granular permissions': pending,
  'Audit logs': pending,
  // Support
  'Support level': <Info value={pending} metadata={'Priority'} />,
};

export { Headline, planInfo, plans, rowHeaders, communityData, commercialData };
