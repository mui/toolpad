import { Box, TextField, Typography } from '@mui/material';
import { ArgTypeDefinitions } from '@mui/studio-core';
import * as React from 'react';
import StringRecordEditor from '../../components/StringRecordEditor';
import { StudioDataSourceClient } from '../../types';
import { WithControlledProp } from '../../utils/types';
import { FetchQuery } from './types';

function ConnectionParamsInput() {
  return <Typography>No input</Typography>;
}

function QueryEditor({ value, onChange }: WithControlledProp<FetchQuery>) {
  const handleUrlChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        ...value,
        url: { type: 'boundExpression', value: event.target.value, format: 'stringLiteral' },
      });
    },
    [onChange, value],
  );

  const handleApiQueryChange = React.useCallback(
    (newValue: Record<string, string>) => {
      onChange({
        ...value,
        params: newValue,
      });
    },
    [onChange, value],
  );

  return (
    <div>
      <TextField
        label="url"
        size="small"
        fullWidth
        value={value.url?.value || ''}
        onChange={handleUrlChange}
      />
      <StringRecordEditor
        label="api query"
        fieldLabel="parameter"
        valueLabel="default value"
        value={value.params || {}}
        onChange={handleApiQueryChange}
      />
      <Box overflow="auto">
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Box>
    </div>
  );
}

function getInitialQueryValue(): FetchQuery {
  return { url: { type: 'const', value: '' }, method: '', headers: [], params: {} };
}

function getArgTypes(query: FetchQuery): ArgTypeDefinitions {
  return Object.fromEntries(
    Object.entries(query.params).map(([propName, defaultValue]) => [
      propName,
      {
        typeDef: { type: 'string' },
        defaultValue,
      },
    ]),
  );
}

const dataSource: StudioDataSourceClient<{}, FetchQuery> = {
  displayName: 'Fetch',
  ConnectionParamsInput,
  isConnectionValid: () => true,
  getInitialConnectionValue: () => ({}),
  QueryEditor,
  getInitialQueryValue,
  getArgTypes,
};

export default dataSource;
