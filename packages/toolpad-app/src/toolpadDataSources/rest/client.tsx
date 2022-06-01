import * as React from 'react';
import { ArgTypeDefinitions, BindableAttrValue, LiveBinding } from '@mui/toolpad-core';
import StringRecordEditor from '../../components/StringRecordEditor';
import { ClientDataSource, QueryEditorProps } from '../../types';
import { FetchQuery } from './types';
import BindableEditor from '../../components/AppEditor/PageEditor/BindableEditor';
import { useEvaluateLiveBinding } from '../../components/AppEditor/useEvaluateLiveBinding';

function ConnectionParamsInput() {
  return null;
}

function QueryEditor({ globalScope, value, onChange }: QueryEditorProps<FetchQuery>) {
  const handleUrlChange = React.useCallback(
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

  const liveUrl: LiveBinding = useEvaluateLiveBinding({
    server: true,
    input: value.url,
    globalScope: globalScope.query ? globalScope : { query: value.params },
  });

  return (
    <div>
      <BindableEditor
        liveBinding={liveUrl}
        globalScope={globalScope}
        server
        label="url"
        argType={{ typeDef: { type: 'string' } }}
        value={value.url}
        onChange={handleUrlChange}
      />
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
  QueryEditor,
  getInitialQueryValue,
  getArgTypes,
};

export default dataSource;
