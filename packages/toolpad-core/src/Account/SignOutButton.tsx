import * as React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthenticationContext } from '../AppProvider/AppProvider';
import { useLocaleText } from '../shared/locales/LocaleContext';

export type SignOutButtonProps = ButtonProps;

export /**
 *
 * Demos:
 *
 * - [Account](https://mui.com/toolpad/core/react-account/)
 *
 * API:
 *
 * - [SignOutButton API](https://mui.com/toolpad/core/api/sign-out-button)
 */ function SignOutButton(props: SignOutButtonProps) {
  const authentication = React.useContext(AuthenticationContext);
  const localeText = useLocaleText();

  return (
    <Button
      disabled={!authentication}
      variant="outlined"
      size="small"
      disableElevation
      onClick={authentication?.signOut}
      sx={{
        textTransform: 'capitalize',
        fontWeight: 'normal',
        filter: 'opacity(0.9)',
        transition: 'filter 0.2s ease-in',
        '&:hover': {
          filter: 'opacity(1)',
        },
      }}
      startIcon={<LogoutIcon />}
      {...props}
    >
      {localeText.signOutLabel}
    </Button>
  );
}
