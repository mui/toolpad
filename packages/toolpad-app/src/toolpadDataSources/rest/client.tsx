import { Stack, TextField } from '@mui/material';
import * as React from 'react';
import { ArgTypeDefinitions, BindableAttrValue } from '@mui/toolpad-core';
import StringRecordEditor from '../../components/StringRecordEditor';
import { BindingEditor } from '../../components/AppEditor/BindingEditor';
import { ClientDataSource, QueryEditorProps } from '../../types';
import { FetchQuery } from './types';
import * as appDom from '../../appDom';
import BindableEditor from '../../components/AppEditor/PageEditor/BindableEditor';

function ConnectionParamsInput() {
  return null;
}

function QueryEditor({ globalScope, value, onChange }: QueryEditorProps<FetchQuery>) {
  const handleUrlChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        ...value,
        url: { type: 'const', value: event.target.value },
      });
    },
    [onChange, value],
  );

  const handleUrlChange2 = React.useCallback(
    (newValue: BindableAttrValue<string> | null) => {
      onChange({ ...value, url: newValue || { type: 'const', value: '' } });
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
      {/* <BindableEditor
        liveBinding={liveBinding}
        globalScope={globalScope}
        server
        label="url"
        argType={{ typeDef: { type: 'string' } }}
        value={value.url}
        onChange={handleUrlChange2}
      /> */}
      <Stack direction="row">
        <TextField
          label="url"
          size="small"
          fullWidth
          value={value.url?.value || ''}
          onChange={handleUrlChange}
          disabled={value.url && value.url.type !== 'const'}
        />
        <BindingEditor
          label="url"
          server
          value={value.url}
          onChange={(url) => onChange({ ...value, url: url || appDom.createConst('') })}
          propType={{ type: 'string' }}
          globalScope={globalScope.query ? globalScope : { query: value.params }}
        />
      </Stack>
      {/* TODO: remove this when QueryStateNode is removed */}
      {globalScope.query ? null : (
        <StringRecordEditor
          label="api query"
          fieldLabel="parameter"
          valueLabel="default value"
          value={value.params || {}}
          onChange={handleApiQueryChange}
        />
      )}
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

const dataSource: ClientDataSource<{}, FetchQuery> = {
  displayName: 'Fetch',
  ConnectionParamsInput,
  isConnectionValid: () => true,
  getInitialConnectionValue: () => ({}),
  QueryEditor,
  getInitialQueryValue,
  getArgTypes,
};

export default dataSource;
