import * as React from 'react';
import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Link } from '@mui/docs/Link';
import Typography from '@mui/material/Typography';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import { alpha } from '@mui/material/styles';

function Banner(props) {
  const { title, description, href, label, category, action } = props;
  return (
    <Stack
      sx={(theme) => ({
        mt: 2,
        p: 2,
        borderRadius: 1,
        background: `linear-gradient(180deg, ${alpha(theme.palette.primary[50], 0.2)}  50%, 
          ${(theme.vars || theme).palette.primary[50]} 100%)
          `,
        border: '1px solid',
        borderColor: 'grey.100',
        display: 'flex',
        flexDirection: {
          xs: 'column',
          sm: 'row',
        },
        justifyContent: 'space-between',
        alignItems: {
          xs: 'flex-start',
          sm: 'center',
        },
        ...theme.applyDarkStyles({
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary[900], 0.4)}  50%, 
            ${alpha(theme.palette.primary[800], 0.6)} 100%)
            `,
          borderColor: (theme.vars || theme).palette.primaryDark[600],
        }),
      })}
    >
      <div>
        <Typography fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </div>
      <Button
        component={Link}
        noLinkStyle
        data-ga-event-category={category}
        data-ga-event-label={label}
        data-ga-event-action={action}
        href={href}
        variant="contained"
        fullWidth
        endIcon={<KeyboardArrowRightRounded />}
        sx={{
          py: 1,
          flexShrink: 0,
          ml: { xs: 0, sm: 2 },
          mt: { xs: 3, sm: 0 },
          width: { xs: '100%', sm: 'fit-content' },
        }}
      >
        {label}
      </Button>
    </Stack>
  );
}

Banner.propTypes = {
  action: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  title: PropTypes.string,
};

export default Banner;
