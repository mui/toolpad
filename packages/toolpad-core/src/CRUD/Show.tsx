'use client';
import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import { CRUDFields, DataModel, DataModelId } from './shared';

export interface ShowProps<D extends DataModel> {
  id: DataModelId;
  /**
   * Fields to show.
   */
  fields: CRUDFields;
  /**
   * Methods to interact with server-side data.
   */
  methods: {
    getOne: (id: DataModelId) => Promise<D>;
  };
}

function Show<D extends DataModel>(props: ShowProps<D>) {
  const { id, fields, methods } = props;
  const { getOne } = methods;

  const [data, setData] = React.useState<D | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const showData = await getOne(id);
      setData(showData);
    } catch (showDataError) {
      setError(showDataError as Error);
    }
    setIsLoading(false);
  }, [getOne, id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const renderShow = React.useMemo(() => {
    if (isLoading) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            m: 1,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
    if (error) {
      return <Alert severity="error">{error.message}</Alert>;
    }

    return data ? (
      <div>
        {fields.map((field) => (
          <Stack key={field.field}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{field.headerName}:</strong> {String(data[field.field])}
            </Typography>
          </Stack>
        ))}
      </div>
    ) : null;
  }, [data, error, fields, isLoading]);

  return <Box sx={{ display: 'flex', flex: 1 }}>{renderShow}</Box>;
}

export { Show };
