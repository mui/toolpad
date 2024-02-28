import * as React from 'react';
import { Link } from '@mui/docs/Link';
import PropTypes from 'prop-types';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import SectionHeadline from 'docs/src/components/typography/SectionHeadline';
import GradientText from 'docs/src/components/typography/GradientText';
import Grid from '@mui/material/Unstable_Grid2';

const ImageContainer = styled(Link)(({ theme }) => [
  {
    position: 'relative',
    width: '100%',
    display: 'block',
    height: 'auto',
    borderRadius: 16,
    padding: 8,
    paddingBottom: 4,
    background: `linear-gradient(120deg, ${(theme.vars || theme).palette.grey[50]} 0%, ${alpha(
      theme.palette.primary[50],
      0.5,
    )} 150%)`,
    border: '1px solid',
    borderColor: (theme.vars || theme).palette.grey[100],
    boxShadow: `0 2px 4px ${alpha(theme.palette.grey[100], 0.8)}`,
    overflow: 'hidden',
  },
  theme.applyDarkStyles({
    background: `linear-gradient(120deg, ${
      (theme.vars || theme).palette.primaryDark[500]
    } 0%, ${alpha(theme.palette.primaryDark[800], 0.4)} 150%)`,
    borderColor: `${alpha(theme.palette.primaryDark[300], 0.3)}`,
    boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.8)}`,
  }),
]);

const Img = styled('img')(({ theme }) => [
  {
    overflow: 'hidden',
    objectFit: 'cover',
    width: '100%',
    height: '100%',
    borderRadius: 10,
    border: '1px solid',
    borderColor: (theme.vars || theme).palette.grey[100],
  },
  theme.applyDarkStyles({
    borderColor: (theme.vars || theme).palette.primaryDark[700],
  }),
]);

function ContentCard({ icon, title, description, href }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 2 }}>
      <Typography
        component="h3"
        variant="subtitle1"
        fontWeight="bold"
        color="text.primary"
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        {icon}
        {title}
      </Typography>
      <Typography variant="body" color="text.secondary">
        {description}
      </Typography>
      <Link href={href} variant="body" sx={{ mt: 0.5 }}>
        View more
        <KeyboardArrowRightRounded fontSize="small" />
      </Link>
    </Box>
  );
}

export default function CardGrid() {
  return (
    <Box
      sx={[
        (theme) => ({
          background: `radial-gradient(140% 140% at 50% 10%, transparent 50%,  ${theme.palette.primary[100]} 90%,  transparent 100%)`,
          ...theme.applyDarkStyles({
            background: `radial-gradient(140% 150% at 50% 10%, transparent 40%,  ${theme.palette.primary[800]} 90%,  transparent 100%)`,
          }),
        }),
      ]}
    >
      <Container
        sx={{
          pt: 8,
          pb: { xs: 8, sm: 12 },
        }}
      >
        <SectionHeadline
          overline="Use cases"
          title={
            <Typography variant="h2">
              Toolpad is <GradientText>ideal for building</GradientText>
            </Typography>
          }
        />
        <Grid container spacing={5} sx={{ mt: { xs: 1, sm: 4 } }}>
          <Grid xs={12} md={6}>
            <ImageContainer noLinkStyle href="/toolpad/examples/npm-stats/">
              <Img src="/static/toolpad/docs/examples/npm-stats.png" width="2880" height="1592" />
            </ImageContainer>
            <ContentCard
              icon={<DashboardRoundedIcon fontSize="small" color="primary" />}
              title="Analytics dashboard"
              description="Build Analytics dashboards to slice and dice any metric across various dimensions. Further, use them to monitor KPIs, track business goals, and identify trends and opportunities. Toolpad allows you to combine data from multiple sources and bind
                it by writing JavaScript anywhere."
              href="/toolpad/examples/npm-stats/"
            />
          </Grid>
          <Grid xs={12} md={6}>
            <ImageContainer noLinkStyle href="/toolpad/examples/basic-crud-app/">
              <Img
                src="/static/toolpad/docs/examples/basic-crud-app.png"
                width="2880"
                height="1592"
              />
            </ImageContainer>
            <ContentCard
              icon={<AdminPanelSettingsRoundedIcon fontSize="small" color="primary" />}
              title="Admin panel"
              description="Enable your teams to quickly view and manage customer orders, queries, and refunds by creating admin apps that gather data from third-party APIs providers like Stripe, Twilio, Zendesk, etc. Toolpad allows end users to create, read, update, or delete records."
              href="/toolpad/examples/basic-crud-app/"
            />
          </Grid>
          <Grid xs={12} md={6}>
            <ImageContainer noLinkStyle href="/toolpad/examples/qr-generator/">
              <Img
                src="/static/toolpad/docs/examples/qr-generator.png"
                width="2880"
                height="1592"
              />
            </ImageContainer>
            <ContentCard
              icon={<HandymanRoundedIcon fontSize="small" color="primary" />}
              title="Utility apps"
              description="Provide the stakeholders with simple apps to manage their daily operations. You can quickly build an app on Toolpad by calling APIs or writing custom functions.
                Your app remains secure as the code never leaves your network, and you can
                securely deploy it to any service you choose."
              href="/toolpad/examples/qr-generator/"
            />
          </Grid>
          <Grid xs={12} md={6}>
            <Box
              sx={[
                (theme) => ({
                  padding: 3,
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(120deg, ${alpha(
                    theme.palette.primary[50],
                    0.2,
                  )} 0%, ${alpha(theme.palette.common.white, 0.2)} 150%)`,
                  backdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: (theme.vars || theme).palette.divider,
                  ...theme.applyDarkStyles({
                    background: `linear-gradient(120deg, ${alpha(
                      theme.palette.primary[900],
                      0.2,
                    )} 0%, ${alpha(theme.palette.primary[800], 0.2)} 150%)`,
                    borderColor: (theme.vars || theme).palette.divider,
                  }),
                }),
              ]}
            >
              <AutoAwesomeRoundedIcon color="warning" sx={{ mb: 2 }} />
              <Typography
                component="h3"
                variant="subtitle1"
                fontWeight="bold"
                color="text.primary"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                Build much more!
              </Typography>
              <Typography variant="body" color="text.secondary" textAlign="center">
                Learn how to build these and many other apps using Toolpad!
              </Typography>
              <Link href="/toolpad/examples/" variant="body" sx={{ mt: 1 }}>
                View more examples
                <KeyboardArrowRightRounded fontSize="small" />
              </Link>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

ContentCard.propTypes = {
  description: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
};

CardGrid.propTypes = {
  content: PropTypes.shape({
    cards: PropTypes.arrayOf(
      PropTypes.shape({
        description: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
        imageUrl: PropTypes.string,
        title: PropTypes.string.isRequired,
      }),
    ),
    Headline: PropTypes.node.isRequired,
    overline: PropTypes.string.isRequired,
  }).isRequired,
};
