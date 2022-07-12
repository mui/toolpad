import * as React from 'react';

import { Box, Skeleton, Stack, Toolbar, Typography } from '@mui/material';
import { BindableAttrValue, BindableAttrValues, LiveBinding } from '@mui/toolpad-core';

import { ClientDataSource, QueryEditorProps } from '../../types';
import { FunctionConnectionParams, FunctionQuery } from './types';
import lazyComponent from '../../utils/lazyComponent';
import ParametersEditor from '../../components/AppEditor/PageEditor/ParametersEditor';
import SplitPane from '../../components/SplitPane';
import { LoadingButton } from '@mui/lab';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { usePrivateQuery } from '../context';

const TypescriptEditor = lazyComponent(() => import('../../components/TypescriptEditor'), {
  noSsr: true,
  fallback: <Skeleton variant="rectangular" height="100%" />,
});

function ConnectionParamsInput() {
  return <Stack direction="column" gap={3} sx={{ py: 3 }} />;
}

const DEFAULT_MODULE = `export default async function () {
  throw new Error('Not implemented');
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

  const [preview, setPreview] = usePrivateQuery(value, {
    enabled: false,
  });

  console.log(preview);

  return (
    <Box sx={{ height: 500, position: 'relative' }}>
      <SplitPane split="vertical" size="50%" allowResize>
        <SplitPane split="horizontal" size="50%" allowResize>
          <TypescriptEditor
            value={value.query.module}
            onChange={(newValue) => onChange({ ...value, query: { module: newValue } })}
          />

          <Box>
            <Typography>Parameters</Typography>
            <ParametersEditor
              value={params}
              onChange={handleParamsChange}
              globalScope={globalScope}
              liveValue={paramsEditorLiveValue}
            />
          </Box>
        </SplitPane>

        <SplitPane split="horizontal" size="50%" allowResize>
          <Box>
            <Toolbar>
              <LoadingButton startIcon={<PlayArrowIcon />}>Preview</LoadingButton>
            </Toolbar>
          </Box>
          <Box>world</Box>
        </SplitPane>
      </SplitPane>
    </Box>
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
