import * as React from 'react';
import {
  Avatar,
  Button,
  Divider,
  Typography,
  Stack,
  IconButton,
} from '@mui/material';
import WalletIcon from '@mui/icons-material/AccountBalance';
import SendIcon from '@mui/icons-material/Send';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import CopyIcon from '@mui/icons-material/ContentCopy';

import {
  Account,
  AccountPreview,
  AccountPopoverFooter,
  SignOutButton,
} from '@toolpad/core/Account';

import {
  AuthenticationContext,
  SessionContext,
  Session,
} from '@toolpad/core/AppProvider';

const demoSession = {
  user: {
    name: 'Bharat Kashyap',
    email: 'bharatkashyap@outlook.com',
    image: 'https://avatars.githubusercontent.com/u/19550456',
  },
};

const mockData = {
  address: '0xb794f5ea0ba39494ce839613fffba74279579268',
  balance: '1,234.56 ETH',
  usdBalance: '$2,345,678.90 USD',
};

function CryptoWalletInfo() {
  return (
    <Stack direction="column">
      <AccountPreview variant="expanded" />
      <Divider />
      <Stack spacing={2} sx={{ width: 320, p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <WalletIcon />
          </Avatar>
          <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {mockData.address}
              </span>
              <IconButton size="small" sx={{ ml: 1 }}>
                <CopyIcon fontSize="small" />
              </IconButton>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Main Account
            </Typography>
          </Stack>
        </Stack>
        <Divider />
        <Stack>
          <Typography variant="h6" fontWeight="bold">
            {mockData.balance}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {mockData.usdBalance}
          </Typography>
        </Stack>
      </Stack>
      <Divider />
      <AccountPopoverFooter sx={{ gap: 2, px: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          disableElevation
          size="small"
          color="primary"
          startIcon={<SendIcon />}
        >
          Send
        </Button>
        <Button variant="outlined" disableElevation startIcon={<ShoppingCart />}>
          Buy
        </Button>
        <SignOutButton color="info" sx={{ textTransform: 'uppercase' }} />
      </AccountPopoverFooter>
    </Stack>
  );
}

export default function AccountSlotsWallet() {
  const [session, setSession] = React.useState<Session | null>(demoSession);
  const authentication = React.useMemo(() => {
    return {
      signIn: () => {
        setSession(demoSession);
      },
      signOut: () => {
        setSession(null);
      },
    };
  }, []);

  return (
    <AuthenticationContext.Provider value={authentication}>
      <SessionContext.Provider value={session}>
        <Account
          slots={{
            popoverContent: CryptoWalletInfo,
          }}
        />
      </SessionContext.Provider>
    </AuthenticationContext.Provider>
  );
}
