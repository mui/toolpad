import { Container } from '@mui/material';
import { Box } from '@mui/system';
import { DataGridPro, GridActionsCellItem, GridColumns, GridRowParams } from '@mui/x-data-grid-pro';
import type { NextPage } from 'next';
import * as React from 'react';
import PresentToAllIcon from '@mui/icons-material/PresentToAll';
import DeleteIcon from '@mui/icons-material/Delete';
import client from '../../../src/api';
import { NextLinkComposed } from '../../../src/components/Link';

interface NavigateToReleaseActionProps {
  version: string;
}

function NavigateToReleaseAction({ version }: NavigateToReleaseActionProps) {
  return (
    <GridActionsCellItem
      icon={<PresentToAllIcon />}
      component={NextLinkComposed}
      to={`/_studio/release/${version}`}
      label="Open"
    />
  );
}

function RemoveReleaseAction({ version }: NavigateToReleaseActionProps) {
  return <GridActionsCellItem icon={<DeleteIcon />} label="Remove Release" />;
}

const COLUMNS: GridColumns = [
  { field: 'version' },
  { field: 'description', flex: 1 },
  { field: 'createdAt', type: 'date' },
  {
    field: 'actions',
    type: 'actions',
    getActions: (params: GridRowParams) => [
      <NavigateToReleaseAction version={params.row.version} />,
      <RemoveReleaseAction version={params.row.version} />,
    ],
  },
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
