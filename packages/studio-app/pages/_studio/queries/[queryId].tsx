import { useRouter } from 'next/router';
import * as React from 'react';
import { useQuery, useMutation } from 'react-query';
import { Container, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DataGrid } from '@mui/x-data-grid';
import { StudioConnection, StudioDataSourceClient, StudioPageQuery } from '../../../src/types';
import dataSources from '../../../src/studioDataSources/client';
import client from '../../../src/api';
import StudioAppBar from '../../../src/components/StudioAppBar';

function getDataSource<Q>(connection: StudioConnection): StudioDataSourceClient<any, Q> | null {
  const dataSource = dataSources[connection.type] as StudioDataSourceClient<any, Q>;
  return dataSource || null;
}

interface QueryEditorProps<Q = unknown> {
  query: StudioPageQuery<Q>;
}

function QueryEditor({ query }: QueryEditorProps) {
  const [value, setValue] = React.useState(query.query ?? {});
  const savedValue = React.useRef(value);
  const isDirty = savedValue.current !== value;

  const { data: connectionData } = useQuery(['connection', query?.connectionId], () =>
    client.query.getConnection(query.connectionId),
  );

  const updateQueryMutation = useMutation(client.mutation.updateQuery, {
    onSuccess: () => {
      savedValue.current = value;
    },
  });

  const datasource = connectionData && getDataSource(connectionData);

  const { data: previewData } = useQuery(['query', value], () =>
    client.query.fetchQueryData({
      ...query,
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
      {updateQueryMutation.error}
      <Typography variant="h4">Preview</Typography>
      <div style={{ height: 300, width: '100%' }}>
        <DataGrid rows={rows} columns={columns} key={columnsFingerPrint} />
      </div>
      <LoadingButton
        disabled={!isDirty}
        loading={updateQueryMutation.isLoading}
        onClick={() => {
          updateQueryMutation.mutate({
            id: query.id,
            query: value,
          });
        }}
      >
        Save
      </LoadingButton>
    </div>
  ) : null;
}

export default function QueryEditorPage() {
  const router = useRouter();
  const { queryId } = router.query;

  const { data: queryData } = useQuery(
    ['query', queryId],
    () => client.query.getQuery(queryId as string),
    {
      enabled: router.isReady,
    },
  );

  return (
    <div>
      <StudioAppBar actions={null} />
      <Container>
        <Typography variant="h3">Edit Query</Typography>
        {queryData && <QueryEditor query={queryData} />}
      </Container>
    </div>
  );
}
