import * as React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, FormControlLabel, FormControlLabelProps } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 *
 * Demos:
 *
 * - [Sign-in Page](https://mui.com/toolpad/core/react-sign-in-page/)
 *
 * API:
 *
 * - [RememberMeCheckbox API](https://mui.com/toolpad/core/api/remember-me-checkbox)
 */
function RememberMeCheckbox(props: Partial<FormControlLabelProps>) {
  const theme = useTheme();
  return (
    <FormControlLabel
      label="Remember me"
      {...props}
      control={
        props.control ? (
          props.control
        ) : (
          <Checkbox
            name="remember"
            value="true"
            color="primary"
            sx={{ padding: 0.5, '& .MuiSvgIcon-root': { fontSize: 20 } }}
          />
        )
      }
      slotProps={{
        ...props.slotProps,
        typography: {
          color: 'textSecondary',
          fontSize: theme.typography.pxToRem(14),
          ...props?.slotProps?.typography,
        },
      }}
    />
  );
}

RememberMeCheckbox.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * A control element. For instance, it can be a `Radio`, a `Switch` or a `Checkbox`.
   */
  control: PropTypes.element.isRequired,
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: PropTypes.shape({
    typography: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  }),
} as any;

export { RememberMeCheckbox };
