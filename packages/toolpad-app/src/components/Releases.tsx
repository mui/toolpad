import { Container, Typography, Box } from '@mui/material';
import { DataGridPro, GridColumns } from '@mui/x-data-grid-pro';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api';
import ToolpadAppShell from './ToolpadAppShell';

interface ReleaseRow {
  createdAt: Date;
  version: number;
  description: string;
}

export default function Releases() {
  const { appId } = useParams();

  if (!appId) {
    throw new Error(`Missing queryParam "appId"`);
  }

  const navigate = useNavigate();
  const { data: releases = [], isLoading, error } = client.useQuery('getReleases', [appId]);

  const activeDeploymentQuery = client.useQuery('findActiveDeployment', [appId]);
  const activeVersion = activeDeploymentQuery.data?.release.version;

  const columns = React.useMemo<GridColumns<ReleaseRow>>(
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
        field: 'active',
        headerName: 'Deployed',
        type: 'boolean',
        valueGetter: (params) => params.row.version === activeVersion,
      },
      {
        field: 'createdAt',
        headerName: 'Created',
        type: 'date',
      },
    ],
    [activeVersion],
  );

  return (
    <ToolpadAppShell appId={appId}>
      <Container>
        <Typography variant="h2">Releases</Typography>
        <Box sx={{ my: 3, height: 350, width: '100%' }}>
          <DataGridPro
            rows={releases}
            columns={columns}
            getRowId={(row) => row.version}
            loading={isLoading}
            error={(error as any)?.message}
            onRowClick={({ row }) => navigate(`/app/${appId}/releases/${row.version}`)}
          />
        </Box>
      </Container>
    </ToolpadAppShell>
  );
}
