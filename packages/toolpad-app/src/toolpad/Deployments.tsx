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
import { useParams } from 'react-router-dom';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import client from '../api';
import { Maybe } from '../utils/types';
import ToolpadAppShell from './ToolpadAppShell';
import DefinitionList from '../components/DefinitionList';
import getReadableDuration from '../utils/readableDuration';
import { Deployment } from '../server/data';

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

function NoActiveDeployment() {
  return (
    <React.Fragment>
      <Typography variant="h5">App not deployed yet</Typography>
    </React.Fragment>
  );
}

export default function Deployments() {
  const { appId } = useParams();

  if (!appId) {
    throw new Error(`Missing queryParam "appId"`);
  }

  const {
    data: rawDeployments = [],
    isLoading,
    error,
  } = client.useQuery('getDeployments', [appId]);

  const deployments = React.useMemo(
    () =>
      rawDeployments.map((deployment) => ({
        ...deployment,
        createdAtRelative: getReadableDuration(deployment.createdAt),
      })),
    [rawDeployments],
  );

  const columns = React.useMemo<GridColumns<typeof deployments[number]>>(
    () => [
      {
        field: 'version',
        valueGetter: ({ row }) => row.release.version,
        headerName: '',
        width: 50,
      },
      {
        field: 'createdAtRelative',
        headerName: 'Deployed',
        width: 150,
      },
      {
        field: 'description',
        valueGetter: ({ row }) => row.release.description,
        headerName: 'Description',
        flex: 1,
      },
    ],
    [],
  );

  const activeDeploymentQuery = client.useQuery('findActiveDeployment', [appId]);

  return (
    <ToolpadAppShell appId={appId}>
      <Container sx={{ my: 3 }}>
        <Stack gap={3}>
          <Breadcrumbs aria-label="breadcrumb">
            <Typography color="text.primary">Deployments</Typography>
          </Breadcrumbs>

          <Paper sx={{ p: 2 }}>
            {activeDeploymentQuery.isLoading || activeDeploymentQuery.data ? (
              <ActiveDeployment value={activeDeploymentQuery.data} />
            ) : (
              <NoActiveDeployment />
            )}
          </Paper>

          <Box sx={{ height: 350, width: '100%' }}>
            <DataGridPro
              rows={deployments}
              columns={columns}
              loading={isLoading}
              error={(error as any)?.message}
            />
          </Box>
        </Stack>
      </Container>
    </ToolpadAppShell>
  );
}
