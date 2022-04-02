import { Stack, TextField, Typography } from '@mui/material';
import * as React from 'react';
import { ArgTypeDefinitions } from '@mui/toolpad-core';
import StringRecordEditor from '../../components/StringRecordEditor';
import { BindingEditor } from '../../components/StudioEditor/BindingEditor';
import { StudioDataSourceClient } from '../../types';
import { WithControlledProp } from '../../utils/types';
import { FetchQuery } from './types';
import * as studioDom from '../../studioDom';

function ConnectionParamsInput() {
  return null;
}

function QueryEditor({ value, onChange }: WithControlledProp<FetchQuery>) {
  const handleUrlChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        ...value,
        url: { type: 'const', value: event.target.value },
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
      <Stack direction="row" gap={1}>
        <TextField
          label="url"
          size="small"
          fullWidth
          value={value.url?.value || ''}
          onChange={handleUrlChange}
          disabled={value.url && value.url.type !== 'const'}
        />
        <BindingEditor
          value={value.url}
          onChange={(url) => onChange({ ...value, url: url || studioDom.createConst('') })}
          propType={{ type: 'string' }}
          globalScope={{ query: value.params }}
        />
      </Stack>
      <StringRecordEditor
        label="api query"
        fieldLabel="parameter"
        valueLabel="default value"
        value={value.params || {}}
        onChange={handleApiQueryChange}
      />
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
