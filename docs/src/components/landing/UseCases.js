import * as React from 'react';
import Link from '@mui/material/Link';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SectionHeadline from 'docs/src/components/typography/SectionHeadline';
import GradientText from 'docs/src/components/typography/GradientText';
import ROUTES from '../../route';

const USE_CASE_IMAGES = new Map([
  ['panel1', '/static/toolpad/marketing/qr-generator.png'],
  ['panel2', '/static/toolpad/marketing/admin-app.png'],
  ['panel3', '/static/toolpad/marketing/npm-stats.png'],
]);

const StyledAccordion = styled(Accordion)(({ theme }) => [
  {
    backgroundColor: 'transparent',
  },
  theme.applyDarkStyles({
    backgroundColor: 'transparent',
  }),
]);

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => [
  {
    margin: '0 -12px',
    padding: '0 12px',
    borderRadius: 12,
    '& h3': {
      marginBottom: 0,
    },
    '& svg': {
      opacity: 0.5,
    },
    '&:hover': {
      backgroundColor: (theme.vars || theme).palette.grey[100],
      '& svg': {
        opacity: 1,
      },
    },
  },
  theme.applyDarkStyles({
    '&:hover': {
      backgroundColor: (theme.vars || theme).palette.primaryDark[800],
    },
  }),
]);

export default function CardGrid() {
  const [expanded, setExpanded] = React.useState('panel1');

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  return (
    <Box
      sx={[
        (theme) => ({
          background: `radial-gradient(140% 150% at 50% 10%, transparent 50%,  ${theme.palette.primary[100]} 90%,  transparent 100%)`,
          ...theme.applyDarkStyles({
            background: `radial-gradient(140% 150% at 50% 10%, transparent 40%,  ${theme.palette.primary[800]} 90%,  transparent 100%)`,
          }),
        }),
      ]}
    >
      <Container sx={{ py: { xs: 8, sm: 12 } }}>
        <SectionHeadline
          overline="Use cases"
          title={
            <Typography variant="h2" maxWidth={300} marginBottom={3}>
              Toolpad is <br />
              <GradientText>ideal for building</GradientText>
            </Typography>
          }
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <StyledAccordion
              expanded={expanded === 'panel1'}
              onChange={handleChange('panel1')}
              disableGutters
              elevation={0}
            >
              <StyledAccordionSummary
                expandIcon={<ExpandMoreIcon color="primary" />}
                aria-controls="use-cases-content"
                id="use-case-header"
              >
                <Typography component="h3" fontWeight="semiBold" color="text.primary" gutterBottom>
                  Utility apps
                </Typography>
              </StyledAccordionSummary>
              <AccordionDetails sx={{ p: 0, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Provide the stakeholders with simple apps to manage their daily operations. You
                  can quickly build an app on Toolpad by calling APIs or writing custom functions.
                  Your app remains secure as the code never leaves your network, and you can
                  securely deploy it to any service you choose.
                </Typography>
                <Link href={ROUTES.toolpadUtilityAppExample} variant="body2" sx={{ mt: 1 }}>
                  View more
                  <KeyboardArrowRightRounded fontSize="small" />
                </Link>
              </AccordionDetails>
            </StyledAccordion>
            <StyledAccordion
              expanded={expanded === 'panel2'}
              onChange={handleChange('panel2')}
              disableGutters
              elevation={0}
            >
              <StyledAccordionSummary
                expandIcon={<ExpandMoreIcon color="primary" />}
                aria-controls="use-cases-content"
                id="use-case-header"
              >
                <Typography component="h3" fontWeight="semiBold" color="text.primary" gutterBottom>
                  Admin panel
                </Typography>
              </StyledAccordionSummary>
              <AccordionDetails sx={{ p: 0, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Enable your teams to quickly view and manage customer orders, queries, and refunds
                  by creating admin apps that gather data from third-party APIs providers like
                  Stripe, Twilio, Zendesk, etc. Toolpad allows end users to create, read, update, or
                  delete records.
                </Typography>
                <Link href={ROUTES.toolpadAdminExample} variant="body2" sx={{ mt: 1 }}>
                  View more
                  <KeyboardArrowRightRounded fontSize="small" />
                </Link>
              </AccordionDetails>
            </StyledAccordion>
            <StyledAccordion
              expanded={expanded === 'panel3'}
              onChange={handleChange('panel3')}
              disableGutters
              elevation={0}
            >
              <StyledAccordionSummary
                expandIcon={<ExpandMoreIcon color="primary" />}
                aria-controls="use-cases-content"
                id="use-case-header"
              >
                <Typography component="h3" fontWeight="semiBold" color="text.primary" gutterBottom>
                  BI dashboard
                </Typography>
              </StyledAccordionSummary>
              <AccordionDetails sx={{ p: 0, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Build BI dashboards to slice and dice any metric across various dimensions.
                  Further, use them to monitor KPIs, track business goals, and identify trends and
                  opportunities. Toolpad allows you to combine data from multiple sources and bind
                  it by writing JavaScript anywhere.
                </Typography>
                <Link href={ROUTES.toolpadBIExample} variant="body2" sx={{ mt: 1 }}>
                  View more
                  <KeyboardArrowRightRounded fontSize="small" />
                </Link>
              </AccordionDetails>
            </StyledAccordion>
          </Box>
          <Box
            sx={[
              (theme) => ({
                display: 'block',
                minWidth: 510,
                minHeight: 320,
                height: 'auto',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                objectFit: 'contain',
                background: `${
                  (theme.vars || theme).palette.primaryDark[800]
                } url(${USE_CASE_IMAGES.get(expanded)})`,
                backgroundSize: 'cover',
                borderRadius: 1,
                border: '1px solid',
                borderColor: (theme.vars || theme).palette.divider,
                overflow: 'auto',
                boxShadow: `0 0 8px 2px ${(theme.vars || theme).palette.primary[50]}, 0 4px 10px ${
                  (theme.vars || theme).palette.primary[100]
                }`,
                ...theme.applyDarkStyles({
                  borderColor: (theme.vars || theme).palette.divider,
                  boxShadow: `0 0 8px 2px ${
                    (theme.vars || theme).palette.primaryDark[600]
                  }, 0 4px 40px ${(theme.vars || theme).palette.primaryDark[500]}`,
                }),
              }),
            ]}
          />
        </Box>
      </Container>
    </Box>
  );
}

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
