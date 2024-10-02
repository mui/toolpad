import * as React from 'react';
import {
  Avatar,
  Divider,
  Button,
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
  AuthenticationContext,
  SessionContext,
  Session,
} from '@toolpad/core';

const demoSession = {
  user: {
    name: 'Bharat Kashyap',
    email: 'bharatkashyap@outlook.com',
    image: 'https://avatars.githubusercontent.com/u/19550456',
  },
};

const mockData = {
  address: '0x1234...5678',
  balance: '1,234.56 ETH',
  usdBalance: '$2,345,678.90 USD',
};

function CryptoWalletInfo() {
  return (
    <div>
      <div style={{ width: 300, padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            <WalletIcon fontSize="medium" />
          </Avatar>
          <div style={{ marginLeft: '1rem' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {mockData.address}
              <IconButton size="small" sx={{ ml: 1 }}>
                <CopyIcon fontSize="small" />
              </IconButton>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Main Account
            </Typography>
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <Typography variant="h6" fontWeight="bold">
            {mockData.balance}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {mockData.usdBalance}
          </Typography>
        </div>
        <Stack direction="row" justifyContent="space-evenly">
          <Button
            variant="contained"
            disableElevation
            color="primary"
            startIcon={<SendIcon />}
          >
            Send
          </Button>
          <Button variant="outlined" disableElevation startIcon={<ShoppingCart />}>
            Buy
          </Button>
        </Stack>
      </div>
      <Divider />
    </div>
  );
}

export default function AccountSlotsInfo() {
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
            content: CryptoWalletInfo,
          }}
        />
      </SessionContext.Provider>
    </AuthenticationContext.Provider>
  );
}
