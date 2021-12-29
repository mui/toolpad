import { useRouter } from 'next/router';
import * as React from 'react';
import { useQuery, useMutation } from 'react-query';
import { Container, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { StudioConnection, StudioDataSourceClient, StudioPageQuery } from '../../../src/types';
import dataSources from '../../../src/studioDataSources/client';
import client from '../../../src/api';

function getDataSource<Q>(connection: StudioConnection): StudioDataSourceClient<any, Q> | null {
  const dataSource = dataSources[connection.type] as StudioDataSourceClient<any, Q>;
  return dataSource || null;
}

interface QueryEditorProps<Q = unknown> {
  query: StudioPageQuery<Q>;
}

function QueryEditor({ query }: QueryEditorProps) {
  const { data: connectionData } = useQuery(['connection', query?.connectionId], () =>
    client.query.getConnection(query.connectionId),
  );

  const updateQueryMutation = useMutation(client.mutation.updateQuery);

  const datasource = connectionData && getDataSource(connectionData);

  const [value, setValue] = React.useState(query.query ?? {});

  return datasource ? (
    <div>
      <datasource.QueryEditor value={value} onChange={setValue} />
      {updateQueryMutation.error}
      <LoadingButton
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
    <Container>
      <Typography variant="h2">Edit Query</Typography>
      {queryData && <QueryEditor query={queryData} />}
    </Container>
  );
}
