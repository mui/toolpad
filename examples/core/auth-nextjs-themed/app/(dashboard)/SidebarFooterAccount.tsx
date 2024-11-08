'use client';
import * as React from 'react';
import Stack from '@mui/material/Stack';
import MenuList from '@mui/material/MenuList';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Divider from '@mui/material/Divider';
import {
  Account,
  AccountPreview,
  AccountPreviewProps,
  AccountPopoverFooter,
  SignOutButton,
} from '@toolpad/core/Account';
import { SidebarFooterProps } from '@toolpad/core/DashboardLayout';

function AccountSidebarPreview(props: AccountPreviewProps & { mini: boolean }) {
  const { handleClick, open, mini } = props;
  return (
    <Stack direction="column" p={0} overflow="hidden">
      <Divider />
      <AccountPreview
        variant={mini ? 'condensed' : 'expanded'}
        slotProps={{ avatarIconButton: { sx: mini ? { border: '0' } : {} } }}
        handleClick={handleClick}
        open={open}
      />
    </Stack>
  );
}

function SidebarFooterAccountPopover({ mini }: { mini: boolean }) {
  return (
    <Stack direction="column">
      {mini ? <AccountPreview variant="expanded" /> : null}
      <MenuList>
        <Button
          variant="text"
          sx={{ textTransform: 'capitalize', display: 'flex', mx: 'auto' }}
          size="small"
          fullWidth
          startIcon={<AddIcon />}
          disableElevation
        >
          Add account
        </Button>
      </MenuList>
      <Divider />
      <AccountPopoverFooter>
        <SignOutButton />
      </AccountPopoverFooter>
    </Stack>
  );
}

const createPreviewComponent = (mini: boolean) => {
  function PreviewComponent(props: AccountPreviewProps) {
    return <AccountSidebarPreview {...props} mini={mini} />;
  }
  return PreviewComponent;
};

const createPopoverComponent = (mini: boolean) => {
  function PopoverComponent() {
    return <SidebarFooterAccountPopover mini={mini} />;
  }
  return PopoverComponent;
};

export default function SidebarFooterAccount({ mini }: SidebarFooterProps) {
  const PreviewComponent = React.useMemo(() => createPreviewComponent(mini), [mini]);
  const PopoverComponent = React.useMemo(() => createPopoverComponent(mini), [mini]);
  return (
    <Account
      slots={{
        preview: PreviewComponent,
        popoverContent: PopoverComponent,
      }}
      slotProps={{
        popover: {
          transformOrigin: { horizontal: 'left', vertical: 'top' },
          anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
          slotProps: {
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
                  bottom: 10,
                  left: 0,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translate(-50%, -50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            },
          },
        },
      }}
    />
  );
}

export function ToolbarAccountOverride() {
  return null;
}
