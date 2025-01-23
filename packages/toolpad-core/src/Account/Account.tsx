import * as React from 'react';
import PropTypes from 'prop-types';
import Button, { ButtonProps } from '@mui/material/Button';
import Popover, { PopoverProps } from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import Stack, { StackProps } from '@mui/material/Stack';
import { SignInButton } from './SignInButton';
import { SignOutButton } from './SignOutButton';
import { AccountPreview, AccountPreviewProps } from './AccountPreview';
import { AccountPopoverHeader } from './AccountPopoverHeader';
import { AccountPopoverFooter } from './AccountPopoverFooter';
import { SessionContext, AuthenticationContext } from '../AppProvider/AppProvider';
import { useLocaleText, type LocaleText } from '../AppProvider/LocalizationProvider';
import { AccountLocaleContext } from './AccountLocaleContext';

interface AccountLocaleText {
  accountPreviewIconButtonLabel: string;
  accountPreviewEmail: string;
  accountPreviewName: string;
  accountPreviewTitle: string;
  accountSignInLabel: string;
  accountSignOutLabel: string;
}

export interface AccountSlots {
  /**
   * The component used for the account preview
   * @default AccountPreview
   */
  preview?: React.JSXElementConstructor<AccountPreviewProps>;
  /**
   * The component used for the account popover menu
   * @default Popover
   */
  popover?: React.JSXElementConstructor<PopoverProps>;
  /**
   * The component used for the content of account popover
   * @default Stack
   */
  popoverContent?: React.JSXElementConstructor<StackProps>;
  /**
   * The component used for the sign in button.
   * @default Button
   */
  signInButton?: React.JSXElementConstructor<ButtonProps>;
  /**
   * The component used for the sign out button.
   * @default Button
   */
  signOutButton?: React.JSXElementConstructor<ButtonProps>;
}

export interface AccountProps {
  /**
   * The components used for each slot inside.
   */
  slots?: AccountSlots;
  /**
   * The props used for each slot inside.
   */
  slotProps?: {
    preview?: AccountPreviewProps;
    popover?: Omit<React.ComponentProps<typeof Popover>, 'open'>;
    popoverContent?: React.ComponentProps<typeof Stack>;
    signInButton?: React.ComponentProps<typeof SignInButton>;
    signOutButton?: React.ComponentProps<typeof Button>;
  };
  /**
   * The labels for the account component.
   */
  localeText?: Partial<AccountLocaleText>;
}

const defaultAccountLocaleText: Pick<LocaleText, keyof AccountLocaleText> = {
  accountPreviewIconButtonLabel: 'Current User',
  accountPreviewEmail: 'Email',
  accountPreviewName: 'Name',
  accountPreviewTitle: 'Account',
  accountSignInLabel: 'Sign in',
  accountSignOutLabel: 'Sign out',
};

/**
 *
 * Demos:
 *
 * - [Account](https://mui.com/toolpad/core/react-account/)
 * - [Dashboard Layout](https://mui.com/toolpad/core/react-dashboard-layout/)
 * - [Sign-in Page](https://mui.com/toolpad/core/react-sign-in-page/)
 *
 * API:
 *
 * - [Account API](https://mui.com/toolpad/core/api/account)
 */
function Account(props: AccountProps) {
  const { localeText: propsLocaleText } = props;
  const globalLocaleText = useLocaleText();
  const localeText = React.useMemo(
    () => ({ ...defaultAccountLocaleText, ...globalLocaleText, ...propsLocaleText }),
    [globalLocaleText, propsLocaleText],
  );
  const { slots, slotProps } = props;
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const session = React.useContext(SessionContext);
  const authentication = React.useContext(AuthenticationContext);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!authentication) {
    return null;
  }

  let accountContent = null;

  if (!session?.user) {
    accountContent = slots?.signInButton ? (
      <slots.signInButton onClick={authentication.signIn} />
    ) : (
      <SignInButton {...slotProps?.signInButton} />
    );
  } else {
    accountContent = (
      <React.Fragment>
        {slots?.preview ? (
          <slots.preview handleClick={handleClick} open={open} />
        ) : (
          <AccountPreview
            variant="condensed"
            handleClick={handleClick}
            open={open}
            {...slotProps?.preview}
          />
        )}
        {slots?.popover ? (
          <slots.popover
            open={open}
            onClick={handleClick}
            onClose={handleClose}
            {...slotProps?.popover}
          />
        ) : (
          <Popover
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            {...slotProps?.popover}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: (theme) =>
                    `drop-shadow(0px 2px 8px ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.32)'})`,
                  mt: 1,
                  '&::before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              },
              ...slotProps?.popover?.slotProps,
            }}
          >
            {slots?.popoverContent ? (
              <slots.popoverContent {...slotProps?.popoverContent} />
            ) : (
              <Stack direction="column" {...slotProps?.popoverContent}>
                <AccountPopoverHeader>
                  <AccountPreview variant="expanded" />
                </AccountPopoverHeader>
                <Divider />
                <AccountPopoverFooter>
                  <SignOutButton {...slotProps?.signOutButton} />
                </AccountPopoverFooter>
              </Stack>
            )}
          </Popover>
        )}
      </React.Fragment>
    );
  }

  return (
    <AccountLocaleContext.Provider value={localeText}>
      {accountContent}
    </AccountLocaleContext.Provider>
  );
}

Account.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The labels for the account component.
   */
  localeText: PropTypes.shape({
    accountPreviewEmail: PropTypes.string,
    accountPreviewIconButtonLabel: PropTypes.string,
    accountPreviewName: PropTypes.string,
    accountPreviewTitle: PropTypes.string,
    accountSignInLabel: PropTypes.string,
    accountSignOutLabel: PropTypes.string,
  }),
  /**
   * The props used for each slot inside.
   */
  slotProps: PropTypes.shape({
    popover: PropTypes.object,
    popoverContent: PropTypes.object,
    preview: PropTypes.shape({
      handleClick: PropTypes.func,
      open: PropTypes.bool,
      slotProps: PropTypes.shape({
        avatar: PropTypes.object,
        avatarIconButton: PropTypes.object,
        moreIconButton: PropTypes.object,
      }),
      slots: PropTypes.shape({
        avatar: PropTypes.elementType,
        avatarIconButton: PropTypes.elementType,
        moreIconButton: PropTypes.elementType,
      }),
      sx: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
        PropTypes.func,
        PropTypes.object,
      ]),
      variant: PropTypes.oneOf(['condensed', 'expanded']),
    }),
    signInButton: PropTypes.object,
    signOutButton: PropTypes.object,
  }),
  /**
   * The components used for each slot inside.
   */
  slots: PropTypes.shape({
    popover: PropTypes.elementType,
    popoverContent: PropTypes.elementType,
    preview: PropTypes.elementType,
    signInButton: PropTypes.elementType,
    signOutButton: PropTypes.elementType,
  }),
} as any;

export { Account };
