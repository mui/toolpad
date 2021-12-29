import { useRouter } from 'next/router';
import * as React from 'react';
import { useQuery, useMutation } from 'react-query';
import { Container, Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DataGrid } from '@mui/x-data-grid';
import { StudioConnection, StudioDataSourceClient, StudioApi } from '../../../src/types';
import dataSources from '../../../src/studioDataSources/client';
import client from '../../../src/api';
import StudioAppBar from '../../../src/components/StudioAppBar';

function getDataSource<Q>(connection: StudioConnection): StudioDataSourceClient<any, Q> | null {
  const dataSource = dataSources[connection.type] as StudioDataSourceClient<any, Q>;
  return dataSource || null;
}

interface ApiEditorProps<Q = unknown> {
  api: StudioApi<Q>;
}

function ApiEditor({ api }: ApiEditorProps) {
  const [value, setValue] = React.useState(api);
  const savedApi = React.useRef(api);
  const isDirty = savedApi.current !== value;

  const { data: connectionData } = useQuery(['connection', api.connectionId], () =>
    client.query.getConnection(api.connectionId),
  );

  const updateApiMutation = useMutation(client.mutation.updateApi, {
    onSuccess: () => {
      savedApi.current = value;
    },
  });

  const datasource = connectionData && getDataSource(connectionData);

  // Stable version of the API
  const previewApi = { ...value, name: 'Preview' };
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
        value={value.name}
        onChange={(event) => setValue((oldApi) => ({ ...oldApi, name: event.target.value }))}
      />
      <datasource.QueryEditor
        value={value.query}
        onChange={(query) => setValue((oldApi) => ({ ...oldApi, query }))}
      />
      {updateApiMutation.error}
      <Typography variant="h4">Preview</Typography>
      <div style={{ height: 300, width: '100%' }}>
        <DataGrid rows={rows} columns={columns} key={columnsFingerPrint} />
      </div>
      <LoadingButton
        disabled={!isDirty}
        loading={updateApiMutation.isLoading}
        onClick={() => {
          updateApiMutation.mutate(value);
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

  const { data: apiData } = useQuery(['api', apiId], () => client.query.getApi(apiId as string), {
    enabled: router.isReady,
  });

  return (
    <div>
      <StudioAppBar actions={null} />
      <Container>
        <Typography variant="h3">Edit Api</Typography>
        {apiData && <ApiEditor api={apiData} />}
      </Container>
    </div>
  );
}
