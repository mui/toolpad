import {
  Container,
  Typography,
  Box,
  Paper,
  Skeleton,
  Button,
  styled,
  Breadcrumbs,
  Stack,
} from '@mui/material';
import { DataGridPro, GridColumns } from '@mui/x-data-grid-pro';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import type { Deployment } from '../../prisma/generated/client';
import client from '../api';
import { Maybe } from '../utils/types';
import ToolpadAppShell from './ToolpadAppShell';
import DefinitionList from '../components/DefinitionList';

interface ReleaseRow {
  createdAt: Date;
  version: number;
  description: string;
}

const DeploymentActions = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

type ActiveDeploymentProps = {
  value?: Maybe<Deployment>;
};

function ActiveDeployment({ value }: ActiveDeploymentProps) {
  const url = value ? String(new URL(`/deploy/${value.appId}`, window.location.href)) : null;

  return (
    <React.Fragment>
      <Typography variant="h5">
        {value ? (
          <React.Fragment>Version &quot;{value.version}&quot;</React.Fragment>
        ) : (
          <Skeleton />
        )}
      </Typography>
      <Typography>Currently active deployment</Typography>
      <DefinitionList>
        <dt>Deployed:</dt>
        <dd>{value ? value.createdAt.toLocaleString('short') : <Skeleton />}</dd>
      </DefinitionList>

      <DeploymentActions>
        <Button
          variant="contained"
          component="a"
          href={url || '#'}
          target="_blank"
          disabled={!url}
          endIcon={<OpenInNewIcon />}
        >
          Open
        </Button>
      </DeploymentActions>
    </React.Fragment>
  );
}

interface NoActiveDeploymentProps {
  appId: string;
  releases?: ReleaseRow[];
}

function NoActiveDeployment({ appId, releases = [] }: NoActiveDeploymentProps) {
  const latestRelease = releases.length > 0 ? releases[0] : null;

  const deployReleaseMutation = client.useMutation('createDeployment');

  const handleDeployClick = React.useCallback(async () => {
    if (latestRelease) {
      await deployReleaseMutation.mutateAsync([appId, latestRelease.version]);
      client.invalidateQueries('findActiveDeployment', [appId]);
    }
  }, [appId, deployReleaseMutation, latestRelease]);

  return (
    <React.Fragment>
      <Typography variant="h5">App not deployed yet</Typography>

      <DeploymentActions>
        {latestRelease ? (
          <Button variant="contained" onClick={handleDeployClick} startIcon={<RocketLaunchIcon />}>
            Deploy version &quot;{latestRelease.version}&quot;
          </Button>
        ) : (
          <Typography>There are no releases to deploy</Typography>
        )}
      </DeploymentActions>
    </React.Fragment>
  );
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
      <Container sx={{ my: 3 }}>
        <Stack gap={3}>
          <Breadcrumbs aria-label="breadcrumb">
            <Typography color="text.primary">Releases</Typography>
          </Breadcrumbs>

          <Paper sx={{ p: 2 }}>
            {activeDeploymentQuery.isLoading || activeDeploymentQuery.data ? (
              <ActiveDeployment value={activeDeploymentQuery.data} />
            ) : (
              <NoActiveDeployment appId={appId} releases={releases} />
            )}
          </Paper>

          <Box sx={{ height: 350, width: '100%' }}>
            <DataGridPro
              rows={releases}
              columns={columns}
              getRowId={(row) => row.version}
              loading={isLoading}
              error={(error as any)?.message}
              onRowClick={({ row }) => navigate(`/app/${appId}/releases/${row.version}`)}
            />
          </Box>
        </Stack>
      </Container>
    </ToolpadAppShell>
  );
}
