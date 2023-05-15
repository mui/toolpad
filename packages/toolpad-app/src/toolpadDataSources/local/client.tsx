import * as React from 'react';
import { BindableAttrEntries, CreateFunctionConfig } from '@mui/toolpad-core';
import { Autocomplete, Button, Stack, TextField, Typography } from '@mui/material';
import { useBrowserJsRuntime } from '@mui/toolpad-core/jsBrowserRuntime';
import { errorFrom } from '@mui/toolpad-utils/errors';
import { ClientDataSource, QueryEditorProps } from '../../types';
import {
  LocalPrivateQuery,
  LocalQuery,
  FetchResult,
  LocalConnectionParams,
  IntrospectionResult,
} from './types';
import {
  useEvaluateLiveBindingEntries,
  useEvaluateLiveBindings,
} from '../../toolpad/AppEditor/useEvaluateLiveBinding';
import * as appDom from '../../appDom';
import SplitPane from '../../components/SplitPane';
import JsonView from '../../components/JsonView';
import useQueryPreview from '../useQueryPreview';
import QueryInputPanel from '../QueryInputPanel';
import useFetchPrivate from '../useFetchPrivate';
import QueryPreview from '../QueryPreview';
import { usePrivateQuery } from '../context';
import BindableEditor from '../../toolpad/AppEditor/PageEditor/BindableEditor';
import { getDefaultControl } from '../../toolpad/propertyControls';

const EMPTY_PARAMS: BindableAttrEntries = [];

function QueryEditor({
  globalScope,
  globalScopeMeta,
  value: input,
  onChange: setInput,
}: QueryEditorProps<LocalConnectionParams, LocalQuery>) {
  const introspection = usePrivateQuery<LocalPrivateQuery, IntrospectionResult>(
    {
      kind: 'introspection',
    },
    { retry: false },
  );

  const functionName: string | undefined = input.attributes.query.value.function;
  const functionDefs: Record<string, CreateFunctionConfig<any>> = introspection.data?.functions ??
  {};
  const parameterDefs = (functionName ? functionDefs?.[functionName]?.parameters : null) || {};

  const paramsEntries = input.params?.filter(([key]) => !!parameterDefs[key]) || EMPTY_PARAMS;

  const paramsObject = Object.fromEntries(paramsEntries);

  const jsBrowserRuntime = useBrowserJsRuntime();

  const paramsEditorLiveValue = useEvaluateLiveBindingEntries({
    jsRuntime: jsBrowserRuntime,
    input: paramsEntries,
    globalScope,
  });

  const previewParams = React.useMemo(
    () => Object.fromEntries(paramsEditorLiveValue.map(([key, binding]) => [key, binding?.value])),
    [paramsEditorLiveValue],
  );

  const fetchPrivate = useFetchPrivate<LocalPrivateQuery, FetchResult>();
  const fetchServerPreview = React.useCallback(
    (query: LocalQuery, params: Record<string, string>) =>
      fetchPrivate({ kind: 'debugExec', query, params }),
    [fetchPrivate],
  );

  const openEditor = React.useCallback(() => {
    fetchPrivate({ kind: 'openEditor' }).catch((err) => {
      // TODO: Write docs with instructions on how to install editor
      // Add a good looking alert box and inline some instructions and link to docs
      // eslint-disable-next-line no-alert
      alert(err.message);
    });
  }, [fetchPrivate]);

  const {
    preview,
    runPreview: handleRunPreview,
    isLoading: previewIsLoading,
  } = useQueryPreview(
    fetchServerPreview,
    input.attributes.query.value,
    previewParams as Record<string, string>,
  );

  const liveBindings = useEvaluateLiveBindings({
    jsRuntime: jsBrowserRuntime,
    input: paramsObject,
    globalScope,
  });

  const introspectionError: string = introspection.error
    ? errorFrom(introspection.error).message
    : '';

  const methodSelectOptions: string[] = React.useMemo(
    () => Object.keys(introspection.data?.functions ?? {}),
    [introspection.data?.functions],
  );

  return (
    <SplitPane split="vertical" size="50%" allowResize>
      <QueryInputPanel onRunPreview={handleRunPreview}>
        <Stack gap={2} sx={{ px: 3, pt: 1 }}>
          <Stack gap={2} direction="row">
            <Autocomplete
              value={functionName ?? ''}
              onChange={(event, newValue) => {
                setInput((existing) =>
                  appDom.setQueryProp(existing, 'function', newValue ?? undefined),
                );
              }}
              loading={introspection.isLoading}
              options={methodSelectOptions}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Function"
                  error={!!introspectionError}
                  helperText={introspectionError}
                />
              )}
            />
            <Button onClick={openEditor}>Open editor</Button>
          </Stack>
          <Typography>Parameters:</Typography>
          <Stack gap={1}>
            {Object.entries(parameterDefs).map(([name, definiton]) => {
              const Control = getDefaultControl(definiton, liveBindings);
              return Control ? (
                <BindableEditor
                  key={name}
                  liveBinding={liveBindings[name]}
                  globalScope={globalScope}
                  globalScopeMeta={globalScopeMeta}
                  label={name}
                  propType={definiton}
                  jsRuntime={jsBrowserRuntime}
                  renderControl={(renderControlParams) => (
                    <Control {...renderControlParams} propType={definiton} />
                  )}
                  value={paramsObject[name]}
                  onChange={(newValue) => {
                    const paramKeys = Object.keys(parameterDefs);
                    const newParams: BindableAttrEntries = paramKeys.flatMap((key) => {
                      const paramValue = key === name ? newValue : paramsObject[key];
                      return paramValue ? [[key, paramValue]] : [];
                    });
                    setInput((existing) => ({
                      ...existing,
                      params: newParams,
                    }));
                  }}
                />
              ) : null;
            })}
          </Stack>
        </Stack>
      </QueryInputPanel>

      <SplitPane
        split="horizontal"
        size="30%"
        minSize={30}
        primary="second"
        allowResize
        pane1Style={{ overflow: 'auto' }}
      >
        <QueryPreview isLoading={previewIsLoading} error={preview?.error}>
          <JsonView sx={{ height: '100%' }} copyToClipboard src={preview?.data} />
        </QueryPreview>
      </SplitPane>
    </SplitPane>
  );
}

function getInitialQueryValue(): LocalQuery {
  return {};
}

const dataSource: ClientDataSource<LocalConnectionParams, LocalQuery> = {
  displayName: 'Local',
  QueryEditor,
  getInitialQueryValue,
  hasDefault: true,
};

export default dataSource;
