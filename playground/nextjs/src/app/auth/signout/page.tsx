import * as React from 'react';
import { Container, Box, Typography } from '@mui/material';
import SignOut from '../../../components/SignOut';

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
        <SignOut />
      </Box>
    </Container>
  );
}
