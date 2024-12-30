import * as React from 'react';
import PropTypes from 'prop-types';
import { FormControlLabel, Checkbox } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface RememberMeProps {
  slotProps?: {
    typography?: React.ComponentProps<typeof FormControlLabel>['slotProps'];
  } & Partial<React.ComponentProps<typeof FormControlLabel>>;
}
/**
 *
 * Demos:
 *
 * - [Sign-in Page](https://mui.com/toolpad/core/react-sign-in-page/)
 *
 * API:
 *
 * - [Remember API](https://mui.com/toolpad/core/api/remember)
 */
function Remember(props: RememberMeProps) {
  const theme = useTheme();
  return (
    <FormControlLabel
      control={
        <Checkbox
          name="remember"
          value="true"
          color="primary"
          sx={{ padding: 0.5, '& .MuiSvgIcon-root': { fontSize: 20 } }}
        />
      }
      label="Remember me"
      {...props}
      slotProps={{
        typography: {
          color: 'textSecondary',
          fontSize: theme.typography.pxToRem(14),
        },
        ...props?.slotProps?.typography,
      }}
    />
  );
}

Remember.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * @ignore
   */
  slotProps: PropTypes.object,
} as any;

export { Remember };
