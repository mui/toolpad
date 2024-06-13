import * as React from 'react';
import { redirect } from 'next/navigation';
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import PasswordIcon from '@mui/icons-material/Password';
import { AuthError } from 'next-auth';
import { signIn, providerMap } from '../../auth';
// import { AuthContext } from '../../AuthContext';

const IconProviderMap = new Map<string, React.ReactNode>([
  ['github', <GitHubIcon />],
  ['credentials', <PasswordIcon />],
  [
    'google',
    <img
      alt="Google logo"
      loading="lazy"
      height="18"
      width="18"
      src="https://authjs.dev/img/providers/google.svg"
      style={{ marginLeft: '2px', marginRight: '2px' }}
    />,
  ],
]);

const IconBackgroundMap = new Map<string, string>([
  ['github', '#24292e'],
  ['credentials', 'default'],
]);

export default function SignInPage() {
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography variant="h5" gutterBottom>
          Sign in
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          with one of the following providers:
        </Typography>
        <div>
          {providerMap.map((provider) => (
            <form
              key={provider.id}
              action={async () => {
                'use server';
                try {
                  await signIn(provider.id, { redirectTo: '/dashboard' });
                } catch (error) {
                  // Signin can fail for a number of reasons, such as the user
                  // not existing, or the user not having the correct role.
                  if (error instanceof AuthError) {
                    return redirect(`/auth-error?error=${error.type}`);
                  }
                  // Otherwise if a redirects happens NextJS can handle it
                  // so you can just re-throw the error and let NextJS handle it.
                  // Docs:
                  // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
                  throw error;
                }
              }}
            >
              <LoadingButton
                key={provider.id}
                variant="contained"
                type="submit"
                fullWidth
                size="large"
                disableElevation
                name={'provider'}
                value={provider.id}
                startIcon={IconProviderMap.get(provider.id)}
                sx={{
                  mt: 3,
                  mb: 2,
                  textTransform: 'capitalize',
                  backgroundColor: IconBackgroundMap.get(provider.id) || '#333',
                  filter: 'opacity(0.9)',
                  transition: 'filter 0.2s ease-in',
                  '&:hover': {
                    backgroundColor: IconBackgroundMap.get(provider.id) || '#333',
                    filter: 'opacity(1)',
                  },
                }}
              >
                <span>Sign in with {provider.name}</span>
              </LoadingButton>
            </form>
          ))}
        </div>
      </Box>
    </Container>
  );
}
