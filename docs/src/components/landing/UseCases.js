import * as React from 'react';
import Link from '@mui/material/Link';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// import Grid from '@mui/material/Unstable_Grid2';
import SectionHeadline from 'docs/src/components/typography/SectionHeadline';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function CardGrid(props) {
  const { content } = props;
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
        <SectionHeadline overline={content.overline} title={content.Headline} />
        {/* <Grid container columns={{ xs: 1, sm: 3 }} spacing={4}>
          {content.cards.map(({ title, imageUrl, description, action }) => (
            <Grid key={title} xs={3} sm={1}>
              <Box key={title}>
                <Box
                  sx={[
                    (theme) => ({
                      display: 'block',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      objectFit: 'contain',
                      background: `${
                        (theme.vars || theme).palette.primaryDark[800]
                      } url(${imageUrl})`,
                      backgroundSize: 'cover',
                      borderRadius: '8px',
                      paddingTop: '55%',
                      overflow: 'auto',
                      boxShadow: `0 0 8px 2px ${
                        (theme.vars || theme).palette.primary[100]
                      }, 0 4px 40px ${(theme.vars || theme).palette.primary[100]}`,
                      ...theme.applyDarkStyles({
                        boxShadow: `0 0 8px 2px ${
                          (theme.vars || theme).palette.primaryDark[600]
                        }, 0 4px 40px ${(theme.vars || theme).palette.primaryDark[500]}`,
                      }),
                    }),
                  ]}
                />
                <Box
                  mt={2}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    component="h3"
                    fontWeight="semiBold"
                    color="text.primary"
                    gutterBottom
                  >
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                  {action ? (
                    <Link href={action.href} variant="body2" sx={{ mt: 1 }}>
                      {action.label}
                      <KeyboardArrowRightRounded font />
                    </Link>
                  ) : null}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid> */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {content.cards.map(({ title, description, action }) => (
              <Accordion
                disableGutters
                elevation={0}
                key={title}
                sx={{ background: 'transparent' }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon color="primary" />}
                  aria-controls="use-cases-content"
                  id="use-case-header"
                  sx={{ p: 0 }}
                >
                  <Typography
                    component="h3"
                    fontWeight="semiBold"
                    color="text.primary"
                    gutterBottom
                  >
                    {title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                  {action ? (
                    <Link href={action.href} variant="body2" sx={{ mt: 1 }}>
                      {action.label}
                      <KeyboardArrowRightRounded fontSize="small" />
                    </Link>
                  ) : null}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
          <Box
            sx={[
              (theme) => ({
                display: 'block',
                minWidth: 510,
                minHeight: 320,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                objectFit: 'contain',
                background: `${
                  (theme.vars || theme).palette.primaryDark[800]
                } url(/static/toolpad/marketing/qr-generator.png)`,
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
