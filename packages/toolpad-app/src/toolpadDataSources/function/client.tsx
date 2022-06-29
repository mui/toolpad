import * as React from 'react';

import { Box, Button, Stack, Toolbar } from '@mui/material';
import * as appDom from '../../appDom';

import { ClientDataSource, ConnectionEditorProps, QueryEditorProps } from '../../types';
import { FunctionConnectionParams, FunctionQuery } from './types';
import { isSaveDisabled } from '../../utils/forms';
import TsModuleEditorTmp from '../../components/TsModuleEditorTmp';

function ConnectionParamsInput({
  value,
  onChange,
}: ConnectionEditorProps<FunctionConnectionParams>) {
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
  connectionParams,
  liveParams,
  value,
  onChange,
}: QueryEditorProps<FunctionConnectionParams, FunctionQuery>) {
  return (
    <TsModuleEditorTmp
      value={value.query.module}
      onChange={(newValue) => onChange({ ...value, query: { module: newValue } })}
    />
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
