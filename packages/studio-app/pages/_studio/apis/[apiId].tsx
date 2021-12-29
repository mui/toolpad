import { useRouter } from 'next/router';
import * as React from 'react';
import { useQuery, useMutation } from 'react-query';
import { Container, Typography } from '@mui/material';
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
  const [value, setValue] = React.useState(api.query ?? {});
  const savedValue = React.useRef(value);
  const isDirty = savedValue.current !== value;

  const { data: connectionData } = useQuery(['connection', api.connectionId], () =>
    client.query.getConnection(api.connectionId),
  );

  const updateApiMutation = useMutation(client.mutation.updateApi, {
    onSuccess: () => {
      savedValue.current = value;
    },
  });

  const datasource = connectionData && getDataSource(connectionData);

  const { data: previewData } = useQuery(['api', value], () =>
    client.query.execApi({
      ...api,
      query: value,
    }),
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
    <div>
      <datasource.QueryEditor value={value} onChange={setValue} />
      {updateApiMutation.error}
      <Typography variant="h4">Preview</Typography>
      <div style={{ height: 300, width: '100%' }}>
        <DataGrid rows={rows} columns={columns} key={columnsFingerPrint} />
      </div>
      <LoadingButton
        disabled={!isDirty}
        loading={updateApiMutation.isLoading}
        onClick={() => {
          updateApiMutation.mutate({
            id: api.id,
            query: value,
          });
        }}
      >
        Save
      </LoadingButton>
    </div>
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
