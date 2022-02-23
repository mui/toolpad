import { Container } from '@mui/material';
import { Box } from '@mui/system';
import { DataGridPro } from '@mui/x-data-grid-pro';
import type { NextPage } from 'next';
import * as React from 'react';
import client from '../../src/api';

const COLUMNS = [
  { field: 'version' },
  { field: 'description' },
  { field: 'createdAt', type: 'date' },
];

const Home: NextPage = () => {
  const { data: releases = [], isLoading, error } = client.useQuery('getReleases', []);
  return (
    <Container>
      <Box sx={{ p: 3, height: 350, width: '100%' }}>
        <DataGridPro
          rows={releases}
          columns={COLUMNS}
          density="compact"
          loading={isLoading}
          error={(error as any)?.message}
        />
      </Box>
    </Container>
  );
};

export default Home;
