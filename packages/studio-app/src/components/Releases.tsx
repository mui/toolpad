import { Container, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { DataGridPro, GridActionsCellItem, GridColumns, GridRowParams } from '@mui/x-data-grid-pro';
import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useNavigate } from 'react-router-dom';
import client from '../api';
import StudioAppBar from './StudioAppBar';

export default function Releases() {
  const navigate = useNavigate();
  const { data: releases = [], isLoading, error, refetch } = client.useQuery('getReleases', []);

  const deleteReleaseMutation = client.useMutation('deleteRelease');
  const deployReleaseMutation = client.useMutation('createDeployment');

  const handleDeleteClick = React.useCallback(
    async (version: string) => {
      // TODO: confirmation dialog here
      await deleteReleaseMutation.mutateAsync([version]);
      refetch();
    },
    [deleteReleaseMutation, refetch],
  );

  const handleDeployClick = React.useCallback(
    async (version: string) => {
      // TODO: confirmation dialog here
      await deployReleaseMutation.mutateAsync([version]);
      refetch();
    },
    [deployReleaseMutation, refetch],
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
            icon={<RocketLaunchIcon />}
            label="Deploy release"
            onClick={() => handleDeployClick(params.row.version)}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Remove release"
            onClick={() => handleDeleteClick(params.row.version)}
          />,
        ],
      },
    ],
    [handleDeleteClick, handleDeployClick],
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
            onRowClick={({ row }) => navigate(`/releases/${row.version}`)}
          />
        </Box>
      </Container>
    </React.Fragment>
  );
}
