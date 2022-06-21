import {
  Button,
  Container,
  Toolbar,
  Typography,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  Stack,
} from '@mui/material';
import * as React from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { Link, useParams } from 'react-router-dom';
import client from '../api';
import ToolpadAppShell from './ToolpadAppShell';
import DefinitionList from './DefinitionList';

function getDeploymentStatusMessage(version: number, activeVersion?: number): React.ReactNode {
  if (typeof activeVersion === 'undefined') {
    return <Typography>App is not deployed</Typography>;
  }

  return version === activeVersion ? (
    <Typography>This is the deployed release</Typography>
  ) : (
    <Typography>
      <MuiLink component={Link} to={`../releases/${activeVersion}`}>
        Version &quot;{activeVersion}&quot;
      </MuiLink>{' '}
      is currently deployed
    </Typography>
  );
}

interface ActiveReleaseMessageProps {
  appId: string;
  version: number;
  activeVersion?: number;
}
function DeploymentStatus({ appId, activeVersion, version }: ActiveReleaseMessageProps) {
  const msg: React.ReactNode = getDeploymentStatusMessage(version, activeVersion);
  const isActiveDeployment = activeVersion === version;

  const deployReleaseMutation = client.useMutation('createDeployment');

  const handleDeployClick = React.useCallback(async () => {
    if (version) {
      await deployReleaseMutation.mutateAsync([appId, version]);
      client.invalidateQueries('findActiveDeployment', [appId]);
    }
  }, [appId, deployReleaseMutation, version]);

  const canDeploy = deployReleaseMutation.isIdle && !isActiveDeployment;

  return (
    <React.Fragment>
      {msg}
      <Toolbar disableGutters sx={{ gap: 1 }}>
        <Button
          variant={isActiveDeployment ? 'contained' : 'outlined'}
          component="a"
          href={`/deploy/${appId}`}
          target="_blank"
          endIcon={<OpenInNewIcon />}
        >
          Open
        </Button>
        <Button
          variant={canDeploy ? 'contained' : 'outlined'}
          disabled={!canDeploy}
          onClick={handleDeployClick}
          startIcon={<RocketLaunchIcon />}
        >
          {version >= (activeVersion ?? -Infinity) ? 'Deploy' : 'Rollback to'} version &quot;
          {version}&quot;
        </Button>
      </Toolbar>
    </React.Fragment>
  );
}

export default function Release() {
  const { version: rawVersion, appId } = useParams();
  const version = Number(rawVersion);

  if (!appId) {
    throw new Error(`Missing queryParam "appId"`);
  }

  const releaseQuery = client.useQuery('getRelease', [appId, version]);

  const activeDeploymentQuery = client.useQuery('findActiveDeployment', [appId]);

  const permaLink = String(new URL(`/app/${appId}/${version}`, window.location.href));

  return (
    <ToolpadAppShell appId={appId}>
      <Container sx={{ my: 3 }}>
        <Stack gap={3}>
          <Breadcrumbs aria-label="breadcrumb">
            <MuiLink component={Link} underline="hover" color="inherit" to="../releases">
              Releases
            </MuiLink>
            <Typography color="text.primary">Version &quot;{version}&quot;</Typography>
          </Breadcrumbs>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5">Version &quot;{version}&quot;</Typography>

            <DefinitionList>
              <dt>Created:</dt>
              <dd>{releaseQuery?.data?.createdAt.toLocaleString('short')}</dd>
              <dt>Description:</dt>
              <dd>{releaseQuery?.data?.description}</dd>
              <dt>Permalink:</dt>
              <dd>
                <MuiLink href={permaLink}>{permaLink}</MuiLink>
              </dd>
            </DefinitionList>
            <DeploymentStatus
              appId={appId}
              version={version}
              activeVersion={activeDeploymentQuery.data?.release.version}
            />
          </Paper>
        </Stack>
      </Container>
    </ToolpadAppShell>
  );
}
