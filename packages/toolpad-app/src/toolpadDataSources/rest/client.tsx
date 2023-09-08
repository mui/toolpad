import * as React from 'react';
import { BindableAttrEntries, BindableAttrValue, ScopeMeta, LiveBinding } from '@mui/toolpad-core';
import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Stack,
  Tab,
  TextField,
  Toolbar,
  Typography,
  Alert,
  styled,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { TabContext, TabList } from '@mui/lab';
import { useBrowserJsRuntime } from '@mui/toolpad-core/jsBrowserRuntime';
import { useServerJsRuntime } from '@mui/toolpad-core/jsServerRuntime';
import { Panel, PanelGroup, PanelResizeHandle } from '../../components/resizablePanels';
import { ClientDataSource, ConnectionEditorProps, QueryEditorProps } from '../../types';
import {
  FetchPrivateQuery,
  FetchQuery,
  FetchResult,
  RestConnectionParams,
  Body,
  ResponseType,
  IntrospectionResult,
} from './types';
import { getAuthenticationHeaders, getDefaultUrl, parseBaseUrl } from './shared';
import BindableEditor, {
  RenderControlParams,
} from '../../toolpad/AppEditor/PageEditor/BindableEditor';
import {
  useEvaluateLiveBinding,
  useEvaluateLiveBindingEntries,
} from '../../toolpad/AppEditor/useEvaluateLiveBinding';
import MapEntriesEditor from '../../components/MapEntriesEditor';
import { Maybe } from '../../utils/types';
import AuthenticationEditor from './AuthenticationEditor';
import { isSaveDisabled, validation } from '../../utils/forms';
import * as appDom from '../../appDom';
import ParametersEditor from '../../toolpad/AppEditor/PageEditor/ParametersEditor';
import BodyEditor from './BodyEditor';
import TabPanel from '../../components/TabPanel';
import JsonView from '../../components/JsonView';
import useQueryPreview from '../useQueryPreview';
import TransformInput from '../TranformInput';
import Devtools from '../../components/Devtools';
import { createHarLog, mergeHar } from '../../utils/har';
import QueryInputPanel from '../QueryInputPanel';
import useFetchPrivate from '../useFetchPrivate';
import QueryPreview from '../QueryPreview';
import { usePrivateQuery } from '../context';
import config from '../../config';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'];

const QUERY_SCOPE_META: ScopeMeta = {
  parameters: {
    description: 'Parameters that can be bound to app scope variables',
  },
};

const ButtonLink = styled('button')(({ theme }) => ({
  background: 'none',
  border: 'none',
  fontSize: 'inherit',
  padding: 0,
  color: theme.palette.primary.main,
  textDecoration: 'underline',
}));

interface UrlControlProps extends RenderControlParams<string> {
  baseUrl: string | null;
}

function UrlControl({ label, disabled, baseUrl, value, onChange }: UrlControlProps) {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange],
  );

  return (
    <TextField
      fullWidth
      value={value ?? ''}
      disabled={disabled}
      onChange={handleChange}
      label={label}
      InputProps={
        baseUrl
          ? {
              startAdornment: <InputAdornment position="start">{baseUrl}</InputAdornment>,
            }
          : undefined
      }
    />
  );
}

function withDefaults(value: Maybe<RestConnectionParams>): RestConnectionParams {
  return {
    baseUrl: '',
    headers: [],
    authentication: null,
    ...value,
  };
}

function ConnectionParamsInput({ value, onChange }: ConnectionEditorProps<RestConnectionParams>) {
  const { handleSubmit, register, formState, reset, control, watch } = useForm({
    defaultValues: withDefaults(value),
    reValidateMode: 'onChange',
    mode: 'all',
  });
  React.useEffect(() => reset(withDefaults(value)), [reset, value]);

  const doSubmit = handleSubmit((connectionParams) =>
    onChange({
      ...connectionParams,
      baseUrl: connectionParams.baseUrl && parseBaseUrl(connectionParams.baseUrl).href,
    }),
  );

  const baseUrlValue = watch('baseUrl');
  const headersValue = watch('headers');
  const authenticationValue = watch('authentication');
  const authenticationHeaders = getAuthenticationHeaders(authenticationValue);

  const mustHaveBaseUrl: boolean =
    (headersValue && headersValue.length > 0) || !!authenticationValue;

  const headersAllowed = !!baseUrlValue;

  const baseUrlInputProps = {
    label: 'base url',
    ...register('baseUrl', {
      validate(input?: string) {
        if (!input) {
          if (mustHaveBaseUrl) {
            return 'A base url is required when headers are used';
          }
          return true;
        }
        try {
          return !!parseBaseUrl(input);
        } catch (error) {
          return 'Must be an absolute url';
        }
      },
    }),
    ...validation(formState, 'baseUrl'),
  };

  return (
    <Stack direction="column" gap={3} sx={{ py: 3 }}>
      <TextField {...baseUrlInputProps} />
      <Typography>Headers:</Typography>
      <Controller
        name="headers"
        control={control}
        render={({ field: { value: fieldValue = [], onChange: onFieldChange, ref, ...field } }) => {
          const allHeaders = [...authenticationHeaders, ...fieldValue];
          return (
            <MapEntriesEditor
              {...field}
              disabled={!headersAllowed}
              fieldLabel="header"
              value={allHeaders}
              onChange={(headers) => onFieldChange(headers.slice(authenticationHeaders.length))}
              isEntryDisabled={(entry, index) => index < authenticationHeaders.length}
            />
          );
        }}
      />
      <Typography>Authentication:</Typography>
      <Controller
        name="authentication"
        control={control}
        render={({ field: { value: fieldValue, ref, ...field } }) => (
          <AuthenticationEditor {...field} disabled={!headersAllowed} value={fieldValue ?? null} />
        )}
      />

      <Toolbar disableGutters>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={doSubmit} disabled={isSaveDisabled(formState)}>
          Save
        </Button>
      </Toolbar>
    </Stack>
  );
}

interface ResolvedPreviewProps {
  preview: FetchResult | null;
  onShowTransform: () => void;
}

function ResolvedPreview({
  preview,
  onShowTransform,
}: ResolvedPreviewProps): React.ReactElement | null {
  if (!preview) {
    return null;
  }

  const { data, untransformedData } = preview;
  let alert = null;
  const responseDataKeys = Object.keys(untransformedData);

  if (typeof data === 'undefined' && typeof untransformedData !== 'undefined') {
    alert = (
      <Alert severity="warning" sx={{ m: 1, p: 1, fontSize: 11 }}>
        <Box sx={{ mb: 1 }}>
          Request successfully completed and returned data
          {responseDataKeys.length > 0 ? ' with the following keys:' : '.'}
        </Box>

        {responseDataKeys.map((key) => (
          <Box sx={{ display: 'block' }} key={key}>
            - {key}
          </Box>
        ))}

        <Box sx={{ mt: 1 }}>
          However, it seems that the <ButtonLink onClick={onShowTransform}>transform</ButtonLink>{' '}
          function returned an <code>undefined</code> value.
        </Box>
      </Alert>
    );
  }

  return (
    <React.Fragment>
      {alert}
      <JsonView sx={{ height: '100%' }} src={preview?.data} />
    </React.Fragment>
  );
}

const EMPTY_PARAMS: BindableAttrEntries = [];

function QueryEditor({
  globalScope,
  globalScopeMeta,
  connectionParams: rawConnectionParams,
  value: input,
  onChange: setInput,
}: QueryEditorProps<RestConnectionParams, FetchQuery>) {
  const isBrowserSide = input.attributes.query.browser;

  const connectionParams = isBrowserSide ? null : rawConnectionParams;
  const baseUrl = isBrowserSide ? null : connectionParams?.baseUrl ?? null;

  const urlValue: BindableAttrValue<string> =
    input.attributes.query.url || getDefaultUrl(config, connectionParams);

  const introspection = usePrivateQuery<FetchPrivateQuery, IntrospectionResult>(
    {
      kind: 'introspection',
    },
    { retry: false },
  );
  const envVarNames = React.useMemo(() => introspection?.data?.envVarNames || [], [introspection]);

  const handleParamsChange = React.useCallback(
    (newParams: [string, BindableAttrValue<string>][]) => {
      setInput((existing) => ({ ...existing, params: newParams }));
    },
    [setInput],
  );

  const handleUrlChange = React.useCallback(
    (newUrl: BindableAttrValue<string> | null) => {
      setInput((existing) => appDom.setQueryProp(existing, 'url', newUrl || ''));
    },
    [setInput],
  );

  const handleMethodChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInput((existing) => appDom.setQueryProp(existing, 'method', event.target.value));
    },
    [setInput],
  );

  const handleTransformEnabledChange = React.useCallback(
    (transformEnabled: boolean) => {
      setInput((existing) => appDom.setQueryProp(existing, 'transformEnabled', transformEnabled));
    },
    [setInput],
  );

  const handleTransformChange = React.useCallback(
    (transform: string) => {
      setInput((existing) => appDom.setQueryProp(existing, 'transform', transform));
    },
    [setInput],
  );

  const handleBodyChange = React.useCallback(
    (newBody: Maybe<Body>) => {
      setInput((existing) => appDom.setQueryProp(existing, 'body', newBody || undefined));
    },
    [setInput],
  );

  const handleSearchParamsChange = React.useCallback(
    (newSearchParams: BindableAttrEntries) => {
      setInput((existing) => appDom.setQueryProp(existing, 'searchParams', newSearchParams));
    },
    [setInput],
  );

  const handleHeadersChange = React.useCallback(
    (newHeaders: BindableAttrEntries) => {
      setInput((existing) => appDom.setQueryProp(existing, 'headers', newHeaders));
    },
    [setInput],
  );

  const handleResponseTypeChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInput((existing) =>
        appDom.setQueryProp(existing, 'response', { kind: event.target.value } as ResponseType),
      );
    },
    [setInput],
  );

  const paramsEntries = input.params || EMPTY_PARAMS;

  const jsBrowserRuntime = useBrowserJsRuntime();
  const jsServerRuntime = useServerJsRuntime();

  const paramsEditorLiveValue = useEvaluateLiveBindingEntries({
    jsRuntime: jsBrowserRuntime,
    input: paramsEntries,
    globalScope,
  });

  const previewParams = React.useMemo(
    () => Object.fromEntries(paramsEditorLiveValue.map(([key, binding]) => [key, binding?.value])),
    [paramsEditorLiveValue],
  );

  const queryScope = React.useMemo(
    () => ({
      parameters: previewParams,
    }),
    [previewParams],
  );

  const liveUrl: LiveBinding = useEvaluateLiveBinding({
    jsRuntime: jsServerRuntime,
    input: urlValue,
    globalScope: queryScope,
  });

  const liveSearchParams = useEvaluateLiveBindingEntries({
    jsRuntime: jsServerRuntime,
    input: input.attributes.query.searchParams || [],
    globalScope: queryScope,
  });

  const liveHeaders = useEvaluateLiveBindingEntries({
    jsRuntime: jsServerRuntime,
    input: input.attributes.query.headers || [],
    globalScope: queryScope,
  });

  const [activeTab, setActiveTab] = React.useState('urlQuery');

  const fetchPrivate = useFetchPrivate<FetchPrivateQuery, FetchResult>();
  const fetchPreview = React.useCallback(
    (query: FetchQuery, params: Record<string, string>) =>
      fetchPrivate({ kind: 'debugExec', query, params }),
    [fetchPrivate],
  );

  const [previewHar, setPreviewHar] = React.useState(() => createHarLog());
  const {
    preview,
    runPreview: handleRunPreview,
    isLoading: previewIsLoading,
  } = useQueryPreview(
    fetchPreview,
    input.attributes.query,
    previewParams as Record<string, string>,
    {
      onPreview(result) {
        setPreviewHar((existing) =>
          result.har ? mergeHar(createHarLog(), existing, result.har) : existing,
        );
      },
    },
  );

  const handleHarClear = React.useCallback(() => setPreviewHar(createHarLog()), []);

  const handleActiveTabChange = React.useCallback(
    (event: React.SyntheticEvent, newValue: string) => setActiveTab(newValue),
    [],
  );

  return (
    <PanelGroup direction="horizontal">
      <Panel defaultSize={50} minSize={20}>
        <PanelGroup direction="vertical">
          <Panel defaultSize={60} minSize={40}>
            <QueryInputPanel onRunPreview={handleRunPreview}>
              <Stack gap={2} sx={{ px: 3, pt: 1 }}>
                <Typography>Query</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                  <TextField
                    select
                    value={input.attributes.query.method || 'GET'}
                    onChange={handleMethodChange}
                  >
                    {HTTP_METHODS.map((method) => (
                      <MenuItem key={method} value={method}>
                        {method}
                      </MenuItem>
                    ))}
                  </TextField>
                  <BindableEditor<string>
                    liveBinding={liveUrl}
                    globalScope={queryScope}
                    globalScopeMeta={QUERY_SCOPE_META}
                    sx={{ flex: 1 }}
                    jsRuntime={jsServerRuntime}
                    label="url"
                    propType={{ type: 'string' }}
                    renderControl={(props) => <UrlControl baseUrl={baseUrl} {...props} />}
                    value={urlValue}
                    onChange={handleUrlChange}
                  />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <TabContext value={activeTab}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <TabList
                        onChange={handleActiveTabChange}
                        aria-label="Fetch options active tab"
                      >
                        <Tab label="URL query" value="urlQuery" />
                        <Tab label="Body" value="body" />
                        <Tab label="Headers" value="headers" />
                        <Tab label="Response" value="response" />
                        <Tab label="Transform" value="transform" />
                      </TabList>
                    </Box>
                    <TabPanel disableGutters value="urlQuery">
                      <ParametersEditor
                        value={input.attributes.query.searchParams ?? []}
                        onChange={handleSearchParamsChange}
                        globalScope={queryScope}
                        globalScopeMeta={QUERY_SCOPE_META}
                        liveValue={liveSearchParams}
                        jsRuntime={jsServerRuntime}
                      />
                    </TabPanel>
                    <TabPanel disableGutters value="body">
                      <BodyEditor
                        value={input.attributes.query.body}
                        onChange={handleBodyChange}
                        globalScope={queryScope}
                        globalScopeMeta={QUERY_SCOPE_META}
                        method={input.attributes.query.method || 'GET'}
                      />
                    </TabPanel>
                    <TabPanel disableGutters value="headers">
                      <ParametersEditor
                        value={input.attributes.query.headers ?? []}
                        onChange={handleHeadersChange}
                        globalScope={queryScope}
                        globalScopeMeta={QUERY_SCOPE_META}
                        liveValue={liveHeaders}
                        jsRuntime={jsServerRuntime}
                        envVarNames={envVarNames}
                      />
                    </TabPanel>
                    <TabPanel disableGutters value="response">
                      <TextField
                        select
                        label="response type"
                        sx={{ width: 200, mt: 1 }}
                        value={input.attributes.query.response?.kind || 'json'}
                        onChange={handleResponseTypeChange}
                      >
                        <MenuItem value="raw">raw</MenuItem>
                        <MenuItem value="json">JSON</MenuItem>
                        <MenuItem value="csv" disabled>
                          🚧 CSV
                        </MenuItem>
                        <MenuItem value="xml" disabled>
                          🚧 XML
                        </MenuItem>
                      </TextField>
                    </TabPanel>
                    <TabPanel disableGutters value="transform">
                      <TransformInput
                        value={input.attributes.query.transform ?? 'return data;'}
                        onChange={handleTransformChange}
                        enabled={input.attributes.query.transformEnabled ?? false}
                        onEnabledChange={handleTransformEnabledChange}
                        globalScope={{ data: preview?.untransformedData }}
                        loading={false}
                      />
                    </TabPanel>
                  </TabContext>
                </Box>
              </Stack>
            </QueryInputPanel>
          </Panel>

          <PanelResizeHandle />

          <Panel>
            <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
              <Typography>Parameters</Typography>
              <ParametersEditor
                value={paramsEntries}
                onChange={handleParamsChange}
                globalScope={globalScope}
                globalScopeMeta={globalScopeMeta}
                liveValue={paramsEditorLiveValue}
                jsRuntime={jsBrowserRuntime}
              />
            </Box>
          </Panel>
        </PanelGroup>
      </Panel>

      <PanelResizeHandle />

      <Panel defaultSize={50} minSize={20}>
        <PanelGroup direction="vertical">
          <Panel defaultSize={60}>
            <QueryPreview isLoading={previewIsLoading} error={preview?.error}>
              <ResolvedPreview
                preview={preview}
                onShowTransform={() => setActiveTab('transform')}
              />
            </QueryPreview>
          </Panel>
          <PanelResizeHandle />
          <Panel>
            <Devtools
              sx={{ width: '100%', height: '100%' }}
              har={previewHar}
              onHarClear={handleHarClear}
            />
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );
}

function getInitialQueryValue(): FetchQuery {
  return {
    method: 'GET',
    headers: [],
    browser: false,
  };
}

const dataSource: ClientDataSource<RestConnectionParams, FetchQuery> = {
  displayName: 'Fetch',
  ConnectionParamsInput,
  QueryEditor,
  getInitialQueryValue,
  hasDefault: true,
};

export default dataSource;
