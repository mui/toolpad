'use client';
import * as React from 'react';
import { usePathname, useParams } from 'next/navigation';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import {
  Account,
  AccountPreview,
  AccountPopoverFooter,
  SignOutButton,
  AccountPreviewProps,
} from '@toolpad/core/Account';
import { DashboardLayout, SidebarFooterProps, ToolbarProps } from '@toolpad/core/DashboardLayout';
import { ToolbarActions } from '@toolpad/core/DashboardLayout/ToolbarActions';
import { AppTitle } from '@toolpad/core/DashboardLayout/AppTitle';
import { PageContainer } from '@toolpad/core/PageContainer';
import { Button, IconButton, InputBase, Paper, Theme } from '@mui/material';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';

const accounts = [
  {
    id: 1,
    name: 'Bharat Kashyap',
    email: 'bharatkashyap@outlook.com',
    image: 'https://avatars.githubusercontent.com/u/19550456',
    projects: [
      {
        id: 3,
        title: 'Project X',
      },
    ],
  },
  {
    id: 2,
    name: 'Bharat MUI',
    email: 'bharat@mui.com',
    color: '#8B4513', // Brown color
    projects: [{ id: 4, title: 'Project A' }],
  },
];

function SearchBar() {
  return (
    <Paper
      component="form"
      elevation={0}
      sx={{
        alignItems: 'center',
        width: 600,
        height: 40,
        px: 1.5,
        borderRadius: 2,
        backgroundColor: (theme) => theme.palette.action.hover,
        display: { xs: 'none', sm: 'flex' },
      }}
    >
      <IconButton type="submit" sx={{ p: '10px' }} aria-label="search" disableRipple>
        <SearchIcon />
      </IconButton>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search"
        inputProps={{ 'aria-label': 'search' }}
      />
    </Paper>
  );
}

function AccountSidebarPreview(props: AccountPreviewProps & { mini: boolean }) {
  const { handleClick, open, mini } = props;
  return (
    <Stack direction="column" p={0} overflow="hidden">
      <Divider />
      <AccountPreview
        variant={mini ? 'condensed' : 'expanded'}
        handleClick={handleClick}
        open={open}
      />
    </Stack>
  );
}

function SidebarFooterAccountPopover() {
  return (
    <Stack direction="column">
      <Typography variant="body2" mx={2} mt={1}>
        Accounts
      </Typography>
      <MenuList>
        {accounts.map((account) => (
          <MenuItem
            key={account.id}
            component="button"
            sx={{
              justifyContent: 'flex-start',
              width: '100%',
              columnGap: 2,
            }}
          >
            <ListItemIcon>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.95rem',
                  bgcolor: account.color,
                }}
                src={account.image ?? ''}
                alt={account.name ?? ''}
              >
                {account.name[0]}
              </Avatar>
            </ListItemIcon>
            <ListItemText
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: '100%',
              }}
              primary={account.name}
              secondary={account.email}
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </MenuItem>
        ))}
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

function SidebarFooterAccount({ mini }: SidebarFooterProps) {
  const PreviewComponent = React.useMemo(() => createPreviewComponent(mini), [mini]);
  return (
    <Account
      slots={{
        preview: PreviewComponent,
        popoverContent: SidebarFooterAccountPopover,
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
                filter: (theme: Theme) =>
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

function Left({ menuIcon }: ToolbarProps) {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      {menuIcon}
      <AppTitle />
    </Stack>
  );
}

function Middle() {
  return (
    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
      <SearchBar />
    </Stack>
  );
}

function Right() {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <ToolbarActions />
      <Account />

      <Link href="/orders">
        <Button color="primary" aria-label="Cart">
          <ShoppingCart />
        </Button>
      </Link>
    </Stack>
  );
}

function CustomToolbar(props: ToolbarProps) {
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      justifyContent={'space-between'}
      sx={{
        flexWrap: 'wrap',
        width: '100%',
      }}
    >
      <Left {...props} />
      <Middle />
      <Right />
    </Stack>
  );
}

export default function DashboardPagesLayout(props: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const [orderId] = params.segments ?? [];

  const title = React.useMemo(() => {
    if (pathname === '/orders/new') {
      return 'New Order';
    }
    if (orderId && pathname.includes('/edit')) {
      return `Order ${orderId} - Edit`;
    }
    if (orderId) {
      return `Order ${orderId}`;
    }
    return undefined;
  }, [orderId, pathname]);

  return (
    <DashboardLayout
      slots={{
        sidebarFooter: SidebarFooterAccount,
        toolbar: CustomToolbar,
      }}
    >
      <PageContainer title={title}>{props.children}</PageContainer>
    </DashboardLayout>
  );
}
