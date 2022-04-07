import { Container, Typography, Box } from '@mui/material';
import {
  DataGridPro,
  GridActionsCellItem,
  GridColumns,
  GridRowParams,
  GridValueGetterParams,
} from '@mui/x-data-grid-pro';
import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api';
import ToolpadAppShell from './ToolpadAppShell';

interface ReleaseRow {
  createdAt: Date;
  id: string;
  version: number;
  description: string;
}

export default function Releases() {
  const { appId } = useParams();

  if (!appId) {
    throw new Error(`Missing queryParam "appId"`);
  }

  const navigate = useNavigate();
  const {
    data: releases = [],
    isLoading,
    error,
    refetch,
  } = client.useQuery('getReleases', [appId]);

  const deleteReleaseMutation = client.useMutation('deleteRelease');
  const deployReleaseMutation = client.useMutation('createDeployment');

  const handleDeleteClick = React.useCallback(
    async (version: number) => {
      // TODO: confirmation dialog here
      await deleteReleaseMutation.mutateAsync([appId, version]);
      refetch();
    },
    [appId, deleteReleaseMutation, refetch],
  );

  const handleDeployClick = React.useCallback(
    async (version: number) => {
      // TODO: confirmation dialog here
      await deployReleaseMutation.mutateAsync([appId, version]);
      refetch();
    },
    [appId, deployReleaseMutation, refetch],
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
        valueGetter: (params: GridValueGetterParams<string, Date>) =>
          params.value ? new Date(params.value) : undefined,
      },
      {
        field: 'actions',
        type: 'actions',
        getActions: (params: GridRowParams) => [
          <GridActionsCellItem
            icon={<RocketLaunchIcon />}
            label="Deploy release"
            onClick={() => handleDeployClick((params.row as ReleaseRow).version)}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Remove release"
            onClick={() => handleDeleteClick((params.row as ReleaseRow).version)}
          />,
        ],
      },
    ],
    [handleDeleteClick, handleDeployClick],
  );

  return (
    <ToolpadAppShell appId={appId}>
      <Container>
        <Typography variant="h2">Releases</Typography>
        <Box sx={{ my: 3, height: 350, width: '100%' }}>
          <DataGridPro
            rows={releases}
            columns={columns}
            density="compact"
            getRowId={(row) => row.version}
            loading={isLoading || deleteReleaseMutation.isLoading}
            error={(error as any)?.message}
            onRowClick={({ row }) => navigate(`/app/${appId}/releases/${row.version}`)}
          />
        </Box>
      </Container>
    </ToolpadAppShell>
  );
}
