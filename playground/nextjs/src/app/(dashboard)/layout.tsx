'use client';

import React from 'react';
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
import { DashboardLayout, SidebarFooterProps, ToolbarActions } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { Box, Button, IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

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

function SearchBar() {
  return (
    <Paper
      component="form"
      elevation={0}
      sx={{
        alignItems: 'center',
        height: 40,
        px: 1.5,
        borderRadius: 2,
        backgroundColor: (theme) => theme.palette.action.hover,
        width: { xl: 600, lg: 400, md: 'auto' },
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

function CustomToolbar() {
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      justifyContent="space-between"
      className="custom-toolbar"
      sx={{
        flexGrow: 1,
        px: 2,
        py: 1,
      }}
    >
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ maxWidth: 400, width: '100%' }}>
          <SearchBar />
        </Box>
      </Box>

      <Stack direction="row" spacing={1} alignItems="center">
        <ToolbarActions />
        <Account />
        <ToolbarCart />
      </Stack>
    </Stack>
  );
}

function ToolbarCart() {
  return (
    <Button color="primary" aria-label="Shopping Cart">
      <ShoppingCartIcon />
    </Button>
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
