import * as React from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import { signOut } from '../auth';

export default async function SignOut() {
  return (
    <form
      action={async () => {
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
  );
}
