import { Container, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { DataGridPro, GridActionsCellItem, GridColumns, GridRowParams } from '@mui/x-data-grid-pro';
import type { NextPage } from 'next';
import * as React from 'react';
import PresentToAllIcon from '@mui/icons-material/PresentToAll';
import { useRouter } from 'next/router';
import client from '../../../src/api';
import * as studioDom from '../../../src/studioDom';
import { asArray } from '../../../src/utils/collections';
import { NodeId } from '../../../src/types';
import StudioAppBar from '../../../src/components/StudioAppBar';

interface NavigateToReleaseActionProps {
  version?: string;
  pageNodeId: NodeId;
}

function NavigateToReleaseAction({ version, pageNodeId }: NavigateToReleaseActionProps) {
  return (
    <GridActionsCellItem
      icon={<PresentToAllIcon />}
      component="a"
      href={`/api/release/${version}/${pageNodeId}`}
      label="Open"
      disabled={!version}
    />
  );
}

const Home: NextPage = () => {
  const router = useRouter();
  const [version] = asArray(router.query.version);
  const {
    data: dom,
    isLoading,
    error,
  } = client.useQuery('loadReleaseDom', version ? [version] : null);
  const app = dom ? studioDom.getApp(dom) : null;
  const { pages = [] } = dom && app ? studioDom.getChildNodes(dom, app) : {};

  const columns: GridColumns = React.useMemo(
    () => [
      { field: 'name' },
      { field: 'title', flex: 1 },
      {
        field: 'actions',
        type: 'actions',
        getActions: (params: GridRowParams) => [
          <NavigateToReleaseAction version={version} pageNodeId={params.row.id} />,
        ],
      },
    ],
    [version],
  );

  return (
    <React.Fragment>
      <StudioAppBar actions={null} />
      <Container>
        <Typography variant="h2">Release &quot;{version}&quot;</Typography>
        <Box sx={{ my: 3, height: 350, width: '100%' }}>
          <DataGridPro
            rows={pages}
            columns={columns}
            density="compact"
            loading={isLoading}
            error={(error as any)?.message}
          />
        </Box>
      </Container>
    </React.Fragment>
  );
};

export default Home;
