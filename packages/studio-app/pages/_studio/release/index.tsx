import { Container, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { DataGridPro, GridActionsCellItem, GridColumns, GridRowParams } from '@mui/x-data-grid-pro';
import type { NextPage } from 'next';
import * as React from 'react';
import PresentToAllIcon from '@mui/icons-material/PresentToAll';
import DeleteIcon from '@mui/icons-material/Delete';
import client from '../../../src/api';
import { NextLinkComposed } from '../../../src/components/Link';
import StudioAppBar from '../../../src/components/StudioAppBar';

const Home: NextPage = () => {
  const { data: releases = [], isLoading, error, refetch } = client.useQuery('getReleases', []);

  const deleteReleaseMutation = client.useMutation('deleteRelease');

  const handleDeleteClick = React.useCallback(
    async (version: string) => {
      // TODO: confirmation dialog here
      await deleteReleaseMutation.mutateAsync([version]);
      refetch();
    },
    [deleteReleaseMutation, refetch],
  );

  const columns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'version',
        headerName: 'Version',
      },
      {
        field: 'description',
        headerName: 'Description',
        flex: 1,
      },
      {
        field: 'createdAt',
        headerName: 'Created',
        type: 'date',
        valueGetter: (params) => new Date(params.value),
      },
      {
        field: 'actions',
        type: 'actions',
        getActions: (params: GridRowParams) => [
          <GridActionsCellItem
            icon={<PresentToAllIcon />}
            component={NextLinkComposed}
            to={`/_studio/release/${params.row.version}`}
            label="Open"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Remove release"
            onClick={() => handleDeleteClick(params.row.version)}
          />,
        ],
      },
    ],
    [handleDeleteClick],
  );

  return (
    <React.Fragment>
      <StudioAppBar actions={null} />
      <Container>
        <Typography variant="h2">Releases</Typography>
        <Box sx={{ my: 3, height: 350, width: '100%' }}>
          <DataGridPro
            rows={releases}
            columns={columns}
            density="compact"
            loading={isLoading || deleteReleaseMutation.isLoading}
            error={(error as any)?.message}
          />
        </Box>
      </Container>
    </React.Fragment>
  );
};

export default Home;
