import * as React from 'react';

import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { BindableAttrValue, BindableAttrValues, LiveBinding } from '@mui/toolpad-core';

import { ClientDataSource, QueryEditorProps } from '../../types';
import { FunctionConnectionParams, FunctionQuery } from './types';
import lazyComponent from '../../utils/lazyComponent';
import ParametersEditor from '../../components/AppEditor/PageEditor/ParametersEditor';

const TypescriptEditor = lazyComponent(() => import('../../components/TypescriptEditor'), {
  noSsr: true,
  fallback: <Skeleton variant="rectangular" height="100%" />,
});

function ConnectionParamsInput() {
  return <Stack direction="column" gap={3} sx={{ py: 3 }} />;
}

const DEFAULT_MODULE = `export default async function () {
  return {
    data: [
      { id: 1, foo: 'bar' }
    ]
  }
}`;

function QueryEditor({
  globalScope,
  liveParams,
  value,
  onChange,
}: QueryEditorProps<FunctionConnectionParams, FunctionQuery>) {
  const [params, setParams] = React.useState<[string, BindableAttrValue<any>][]>(
    Object.entries(value.params || ({} as BindableAttrValue<Record<string, any>>)),
  );

  React.useEffect(
    () => setParams(Object.entries(value.params || ({} as BindableAttrValue<Record<string, any>>))),
    [value.params],
  );

  const handleParamsChange = React.useCallback(
    (newParams: [string, BindableAttrValue<any>][]) => {
      setParams(newParams);
      const paramsObj: BindableAttrValues<any> = Object.fromEntries(newParams);
      onChange({ ...value, params: paramsObj });
    },
    [onChange, value],
  );

  const paramsEditorLiveValue: [string, LiveBinding][] = params.map(([key]) => [
    key,
    liveParams[key],
  ]);

  return (
    <Stack gap={2}>
      <Typography>Parameters</Typography>
      <ParametersEditor
        value={params}
        onChange={handleParamsChange}
        globalScope={globalScope}
        liveValue={paramsEditorLiveValue}
      />
      <Box sx={{ height: 250 }}>
        <TypescriptEditor
          path={`./dataSources/function`}
          value={value.query.module}
          onChange={(newValue) => onChange({ ...value, query: { module: newValue } })}
        />
      </Box>
    </Stack>
  );
}

function getInitialQueryValue(): FunctionQuery {
  return { module: DEFAULT_MODULE };
}

const dataSource: ClientDataSource<FunctionConnectionParams, FunctionQuery> = {
  displayName: 'Function',
  ConnectionParamsInput,
  isConnectionValid: () => true,
  QueryEditor,
  getInitialQueryValue,
};

export default dataSource;
