'use client';

import * as React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { useSearchParams } from 'next/navigation';

enum Error {
  Configuration = 'Configuration',
}

const errorMap = {
  [Error.Configuration]: (
    <p>
      There was a problem when trying to authenticate. Please contact us if this error persists.
      Unique error code: <code>Configuration</code>
    </p>
  ),
};

export default function AuthErrorPage() {
  const search = useSearchParams();

  const error = search.get('error') as Error;
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
          Something went wrong
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          {errorMap[error] || 'Please contact us if this error persists.'}
        </Typography>
        <Button
          variant="contained"
          disableElevation
          sx={{
            mt: 3,
            mb: 2,
            backgroundColor: '#29242e',
            textTransform: 'capitalize',
            filter: 'opacity(0.9)',
            transition: 'filter 0.2s ease-in',
            '&:hover': {
              backgroundColor: '#29242e',
              filter: 'opacity(1)',
            },
          }}
          href="/"
        >
          Go to Home
        </Button>
      </Box>
    </Container>
  );
}
