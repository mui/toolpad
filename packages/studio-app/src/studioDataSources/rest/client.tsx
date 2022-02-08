import { Box, TextField } from '@mui/material';
import * as React from 'react';
import StringRecordEditor from '../../StringRecordEditor';
import { StudioDataSourceClient } from '../../types';
import { WithControlledProp } from '../../utils/types';
import { FetchQuery } from './types';

function ConnectionParamsInput() {
  return null;
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

const dataSource: StudioDataSourceClient<{}, FetchQuery> = {
  displayName: 'Fetch',
  ConnectionParamsInput,
  isConnectionValid: () => true,
  getInitialConnectionValue: () => ({}),
  QueryEditor,
  getInitialQueryValue,
};

export default dataSource;
