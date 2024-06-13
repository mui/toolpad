import * as React from 'react';
import { signOut } from '../../auth.ts';
import { Container, Box, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';

export default function SignOutPage() {
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
        <Typography variant="h5" gutterBottom>
          Sign out
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          You will be redirected to the home page.
        </Typography>

        <form
          action={async (formData) => {
            'use server';
            await signOut({ redirectTo: '/signin' });
          }}
        >
          <LoadingButton
            variant="contained"
            type="submit"
            fullWidth
            size="large"
            disableElevation
            name={'provider'}
            sx={{
              mt: 3,
              mb: 2,
              textTransform: 'capitalize',
              backgroundColor: '#24292e',
              filter: 'opacity(0.9)',
              transition: 'filter 0.2s ease-in',
              '&:hover': {
                backgroundColor: '#24292e',
                filter: 'opacity(1)',
              },
            }}
          >
            <span>Sign out</span>
          </LoadingButton>
        </form>
      </Box>
    </Container>
  );
}
