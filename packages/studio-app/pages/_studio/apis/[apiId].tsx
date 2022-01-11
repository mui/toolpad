import { useRouter } from 'next/router';
import * as React from 'react';
import { useQuery, useMutation } from 'react-query';
import { Container, Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DataGrid } from '@mui/x-data-grid';
import {
  DefaultNodeProps,
  NodeId,
  StudioConnection,
  StudioDataSourceClient,
} from '../../../src/types';
import dataSources from '../../../src/studioDataSources/client';
import client from '../../../src/api';
import StudioAppBar from '../../../src/components/StudioAppBar';
import * as studioDom from '../../../src/studioDom';

function getDataSource<Q>(connection: StudioConnection): StudioDataSourceClient<any, Q> | null {
  const dataSource = dataSources[connection.type] as StudioDataSourceClient<any, Q>;
  return dataSource || null;
}

interface ApiEditorProps {
  dom: studioDom.StudioDom;
  apiNodeId: NodeId;
}

function ApiEditor<Q extends DefaultNodeProps>({ dom, apiNodeId }: ApiEditorProps) {
  const api = studioDom.getNode(dom, apiNodeId);
  studioDom.assertIsApi<Q>(api);

  const [name, setName] = React.useState(api.name);
  const [query, setQuery] = React.useState(studioDom.getConstPropValues(api) as Q);

  const { data: connectionData } = useQuery(['connection', api.connectionId], () =>
    client.query.getConnection(api.connectionId),
  );

  const saveDomMutation = useMutation(client.mutation.saveApp);

  const datasource = connectionData && getDataSource<Q>(connectionData);

  const previewApi = { ...api, query };
  const { data: previewData } = useQuery(['api', previewApi], () =>
    client.query.execApi(previewApi),
  );

  const { fields = {}, data: rows = [] } = previewData ?? {};

  const columns = React.useMemo(
    () =>
      Object.entries(fields).map(([field, def]) => ({
        ...(def as any),
        field,
      })),
    [fields],
  );

  const columnsFingerPrint = React.useMemo(() => JSON.stringify(columns), [columns]);

  return datasource ? (
    <Stack direction="column" spacing={3} mt={3}>
      <TextField
        label="name"
        size="small"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <datasource.QueryEditor value={query} onChange={(newQuery) => setQuery(newQuery)} />
      {saveDomMutation.error}
      <Typography variant="h4">Preview</Typography>
      <div style={{ height: 300, width: '100%' }}>
        <DataGrid rows={rows} columns={columns} key={columnsFingerPrint} />
      </div>
      <LoadingButton
        loading={saveDomMutation.isLoading}
        onClick={() => {
          const toSaveDom = studioDom.setNodePropConstValues(dom, api, query);
          saveDomMutation.mutate(toSaveDom);
        }}
      >
        Save
      </LoadingButton>
    </Stack>
  ) : null;
}

export default function ApiEditorPage() {
  const router = useRouter();
  const { apiId } = router.query;

  const domQuery = useQuery('dom', client.query.loadApp);

  return (
    <div>
      <StudioAppBar actions={null} />
      <Container>
        <Typography variant="h3">Edit Api</Typography>
        {domQuery.data && router.isReady && (
          <ApiEditor dom={domQuery.data} apiNodeId={apiId as NodeId} />
        )}
      </Container>
    </div>
  );
}
