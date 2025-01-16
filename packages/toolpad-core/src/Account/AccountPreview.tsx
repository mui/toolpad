import * as React from 'react';
import PropTypes from 'prop-types';
import Avatar, { AvatarProps } from '@mui/material/Avatar';
import { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { SessionContext } from '../AppProvider';
import { useLocaleText } from '../shared/locales/LocaleContext';

export type AccountPreviewVariant = 'condensed' | 'expanded';

export interface AccountPreviewSlots {
  /**
   * The component used for the Avatar
   * @default Avatar
   */
  avatar?: React.ElementType;
  /**
   * The component used for the overflow icon button in the expanded variant
   * @default IconButton
   */
  moreIconButton?: React.ElementType;
  /**
   * The component used for the avatar icon button in the condensed variant
   * @default IconButton
   */
  avatarIconButton?: React.ElementType;
}

export interface AccountPreviewProps {
  /**
   * The components used for each slot inside.
   */
  slots?: AccountPreviewSlots;
  /**
   * The props used for each slot inside.
   */
  slotProps?: {
    avatar?: AvatarProps;
    moreIconButton?: IconButtonProps;
    avatarIconButton?: IconButtonProps;
  };
  /**
   * The type of account details to display.
   * @property {'condensed'} condensed - Shows only the user's avatar.
   * @property {'expanded'} expanded - Displays the user's avatar, name, and email if available.
   * @default 'condensed'
   */
  variant?: AccountPreviewVariant;
  /**
   * The handler used when the preview is expanded
   */
  handleClick?: React.MouseEventHandler<HTMLElement>;
  /**
   * The state of the Account popover
   * @default false
   */
  open?: boolean;
  /**
   * The prop used to customize the styling of the preview
   */
  sx?: SxProps;
}

/**
 * The AccountPreview component displays user account information.
 *
 * Demos:
 *
 * - [Account](https://mui.com/toolpad/core/react-account/)
 *
 * API:
 *
 * - [AccountPreview API](https://mui.com/toolpad/core/api/account-preview)
 */
function AccountPreview(props: AccountPreviewProps) {
  const { slots, variant = 'condensed', slotProps, open, handleClick, sx } = props;
  const session = React.useContext(SessionContext);
  const localeText = useLocaleText();

  if (!session || !session.user) {
    return null;
  }

  const avatarContent = slots?.avatar ? (
    <slots.avatar />
  ) : (
    <Avatar
      src={session.user?.image || ''}
      alt={session.user?.name || session.user?.email || ''}
      sx={{ height: variant === 'expanded' ? 48 : 32, width: variant === 'expanded' ? 48 : 32 }}
      {...slotProps?.avatar}
    />
  );

  if (variant === 'expanded') {
    return (
      <Stack direction="row" justifyContent="space-between" sx={{ py: 1, px: 2, gap: 2, ...sx }}>
        <Stack direction="row" justifyContent="flex-start" spacing={2} overflow="hidden">
          {avatarContent}
          <Stack direction="column" justifyContent="space-evenly" overflow="hidden">
            <Typography variant="body2" fontWeight="bolder" noWrap>
              {session.user?.name}
            </Typography>
            <Typography variant="caption" noWrap>
              {session.user?.email}
            </Typography>
          </Stack>
        </Stack>
        {handleClick &&
          (slots?.moreIconButton ? (
            <slots.moreIconButton />
          ) : (
            <IconButton
              size="small"
              onClick={handleClick}
              {...slotProps?.moreIconButton}
              sx={{ alignSelf: 'center', ...slotProps?.moreIconButton?.sx }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          ))}
      </Stack>
    );
  }

  return (
    <Tooltip title={session.user.name ?? 'Account'}>
      {slots?.avatarIconButton ? (
        <slots.avatarIconButton {...slotProps?.avatarIconButton} />
      ) : (
        <Stack sx={{ py: 0.5, ...sx }}>
          <IconButton
            onClick={handleClick}
            aria-label={localeText.iconButtonAriaLabel || 'Current User'}
            size="small"
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            {...slotProps?.avatarIconButton}
            sx={{ width: 'fit-content', margin: '0 auto', ...slotProps?.avatarIconButton?.sx }}
          >
            {avatarContent}
          </IconButton>
        </Stack>
      )}
    </Tooltip>
  );
}

AccountPreview.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The handler used when the preview is expanded
   */
  handleClick: PropTypes.func,
  /**
   * The state of the Account popover
   * @default false
   */
  open: PropTypes.bool,
  /**
   * The props used for each slot inside.
   */
  slotProps: PropTypes.shape({
    avatar: PropTypes.object,
    avatarIconButton: PropTypes.object,
    moreIconButton: PropTypes.object,
  }),
  /**
   * The components used for each slot inside.
   */
  slots: PropTypes.shape({
    avatar: PropTypes.elementType,
    avatarIconButton: PropTypes.elementType,
    moreIconButton: PropTypes.elementType,
  }),
  /**
   * The prop used to customize the styling of the preview
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * The type of account details to display.
   * @property {'condensed'} condensed - Shows only the user's avatar.
   * @property {'expanded'} expanded - Displays the user's avatar, name, and email if available.
   * @default 'condensed'
   */
  variant: PropTypes.oneOf(['condensed', 'expanded']),
} as any;

export { AccountPreview };
