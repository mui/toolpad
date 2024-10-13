import * as React from 'react';
import PropTypes from 'prop-types';
import Avatar, { AvatarProps } from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { SessionContext } from '../AppProvider';

export interface AccountDetailsSlots {
  /**
   * The component used for the Avatar
   * @default Avatar
   */
  avatar?: React.ElementType;
}

export interface AccountDetailsProps {
  /**
   * The components used for each slot inside.
   */
  slots?: AccountDetailsSlots;
  /**
   * The props used for each slot inside.
   */
  slotProps?: {
    avatar: AvatarProps;
  };
}
/**
 *
 * Demos:
 *
 * - [Account](https://mui.com/toolpad/core/react-account/)
 *
 * API:
 *
 * - [AccountDetails API](https://mui.com/toolpad/core/api/account-details)
 */
function AccountDetails(props: AccountDetailsProps) {
  const { slots, slotProps } = props;
  const session = React.useContext(SessionContext);

  if (!session) {
    return null;
  }

  return (
    <Stack direction="column">
      <Stack direction="row" justifyContent="flex-start" spacing={2} gap={1} padding={2}>
        {slots?.avatar ? (
          <slots.avatar />
        ) : (
          <Avatar
            src={session.user?.image || ''}
            alt={session.user?.name || session.user?.email || ''}
            sx={{ height: 48, width: 48 }}
            {...slotProps?.avatar}
          />
        )}
        <Stack direction="column">
          <Typography fontWeight="bolder">{session.user?.name}</Typography>
          <Typography variant="caption">{session.user?.email}</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}

AccountDetails.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The props used for each slot inside.
   */
  slotProps: PropTypes.shape({
    avatar: PropTypes.object.isRequired,
  }),
  /**
   * The components used for each slot inside.
   */
  slots: PropTypes.shape({
    avatar: PropTypes.elementType,
  }),
} as any;

export { AccountDetails };
