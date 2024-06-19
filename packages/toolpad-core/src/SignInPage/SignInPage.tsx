'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import PasswordIcon from '@mui/icons-material/Password';
import Stack from '@mui/material/Stack';
import { BrandingContext } from '../AppProvider';

const IconProviderMap = new Map<string, React.ReactNode>([
  ['github', <GitHubIcon key="github" />],
  ['credentials', <PasswordIcon key="credentials" />],
  [
    'google',
    <img
      alt="Google logo"
      loading="lazy"
      key="google"
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

export interface AuthProvider {
  id: string;
  name: string;
}

export interface SignInPageProps {
  providers?: AuthProvider[];
  signIn: (provider: AuthProvider, formData?: FormData) => void;
}

export function SignInPage({ providers, signIn }: SignInPageProps) {
  const branding = React.useContext(BrandingContext);
  const credentialsProvider = providers?.find((provider) => provider.id === 'credentials');
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
          {branding?.logo ?? <LockOutlinedIcon />}
        </Avatar>
        <Typography variant="h5" gutterBottom>
          Sign in {branding?.title ? `to ${branding.title}` : null}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Welcome user, please sign in to continue
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Stack spacing={1}>
            {Object.values(providers ?? {}).map((provider) => {
              if (provider.id === 'credentials') {
                return null;
              }
              return (
                <form
                  key={provider.id}
                  action={() => {
                    signIn(provider);
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
              );
            })}
          </Stack>

          {credentialsProvider ? (
            <React.Fragment>
              <Divider sx={{ mt: 2, mx: 0 }}>or</Divider>
              <Box
                component="form"
                action={(formData) => {
                  signIn(credentialsProvider, formData);
                }}
                noValidate
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                />
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Remember me"
                />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                  Sign In
                </Button>
                <Grid container>
                  <Grid item xs>
                    <Link href="#" variant="body2">
                      Forgot password?
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link href="#" variant="body2">
                      {"Don't have an account? Sign Up"}
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            </React.Fragment>
          ) : null}
        </Box>
      </Box>
    </Container>
  );
}
