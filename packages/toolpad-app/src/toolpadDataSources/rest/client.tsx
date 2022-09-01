import * as React from 'react';
import { BindableAttrValue, LiveBinding } from '@mui/toolpad-core';
import {
  Box,
  Button,
  Divider,
  InputAdornment,
  MenuItem,
  Stack,
  Tab,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { TabContext, TabList } from '@mui/lab';
import {
  ClientDataSource,
  ConnectionEditorProps,
  QueryEditorModel,
  QueryEditorProps,
} from '../../types';
import {
  FetchPrivateQuery,
  FetchQuery,
  FetchResult,
  RestConnectionParams,
  Body,
  FetchParams,
} from './types';
import { getAuthenticationHeaders, parseBaseUrl } from './shared';
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
import SplitPane from '../../components/SplitPane';
import ErrorAlert from '../../toolpad/AppEditor/PageEditor/ErrorAlert';
import JsonView from '../../components/JsonView';
import useQueryPreview from '../useQueryPreview';
import TransformInput from '../TranformInput';
import Devtools from '../../components/Devtools';
import { createHarLog, mergeHar } from '../../utils/har';
import QueryInputPanel from '../QueryInputPanel';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'];

interface UrlControlProps extends RenderControlParams<string> {
  baseUrl?: string;
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

  return (
    <Stack direction="column" gap={3} sx={{ py: 3 }}>
      <TextField
        label="base url"
        {...register('baseUrl', {
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
        })}
        {...validation(formState, 'baseUrl')}
      />
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

function fromLegacy(
  value: QueryEditorModel<FetchQuery, any>,
): QueryEditorModel<FetchQuery, FetchParams> {
  if (value.params?.searchParams) {
    return value;
  }
  return {
    ...value,
    params: { searchParams: value.params ? Object.entries(value.params) : [] },
  };
}

function QueryEditor({
  globalScope,
  connectionParams,
  value: valueProp,
  onChange,
  QueryEditorShell,
}: QueryEditorProps<RestConnectionParams, FetchQuery, FetchParams>) {
  const value = React.useMemo(() => fromLegacy(valueProp), [valueProp]);

  const [input, setInput] = React.useState(value);
  React.useEffect(() => setInput(value), [value]);

  const baseUrl = connectionParams?.baseUrl;

  const handleSearchParamsChange = React.useCallback(
    (newParams: [string, BindableAttrValue<string>][]) => {
      setInput((existing) => ({
        ...existing,
        params: { ...existing.params, searchParams: newParams },
      }));
    },
    [],
  );

  const handleUrlChange = React.useCallback((newUrl: BindableAttrValue<string> | null) => {
    setInput((existing) => ({
      ...existing,
      query: { ...existing.query, url: newUrl || appDom.createConst('') },
    }));
  }, []);

  const handleMethodChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInput((existing) => ({
      ...existing,
      query: { ...existing.query, method: event.target.value },
    }));
  }, []);

  const handleTransformEnabledChange = React.useCallback((transformEnabled: boolean) => {
    setInput((existing) => ({
      ...existing,
      query: { ...existing.query, transformEnabled },
    }));
  }, []);

  const handleTransformChange = React.useCallback((transform: string) => {
    setInput((existing) => ({
      ...existing,
      query: { ...existing.query, transform },
    }));
  }, []);

  const handleBodyChange = React.useCallback((newBody: Maybe<Body>) => {
    setInput((existing) => ({
      ...existing,
      params: { ...existing.params, body: newBody || undefined },
    }));
  }, []);

  const paramsEditorLiveValue = useEvaluateLiveBindingEntries({
    input: input.params?.searchParams ?? [],
    globalScope,
  });

  const previewParams = React.useMemo(
    () => Object.fromEntries(paramsEditorLiveValue.map(([key, binding]) => [key, binding?.value])),
    [paramsEditorLiveValue],
  );

  const queryScope = {
    query: previewParams,
  };

  const liveUrl: LiveBinding = useEvaluateLiveBinding({
    server: true,
    input: input.query.url,
    globalScope: queryScope,
  });

  const [previewHar, setPreviewHar] = React.useState(() => createHarLog());
  const { preview, runPreview: handleRunPreview } = useQueryPreview<FetchPrivateQuery, FetchResult>(
    {
      kind: 'debugExec',
      query: input.query,
      params: previewParams,
    },
    {
      onPreview(result) {
        setPreviewHar((existing) => mergeHar(createHarLog(), existing, result.har));
      },
    },
  );

  const handleHarClear = React.useCallback(() => setPreviewHar(createHarLog()), []);

  const handleCommit = React.useCallback(() => onChange(input), [onChange, input]);

  const isDirty = input !== value;

  const [activeTab, setActiveTab] = React.useState('body');

  const handleActiveTabChange = React.useCallback(
    (event: React.SyntheticEvent, newValue: string) => setActiveTab(newValue),
    [],
  );

  return (
    <QueryEditorShell onCommit={handleCommit} isDirty={isDirty}>
      <SplitPane split="vertical" size="50%" allowResize>
        <QueryInputPanel onRunPreview={handleRunPreview}>
          <Stack gap={2} sx={{ px: 3, pt: 1 }}>
            <Typography>Parameters</Typography>
            <ParametersEditor
              value={input.params?.searchParams || []}
              onChange={handleSearchParamsChange}
              globalScope={globalScope}
              liveValue={paramsEditorLiveValue}
            />
            <Divider />
            <Typography>Query</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
              <TextField select value={input.query.method || 'GET'} onChange={handleMethodChange}>
                {HTTP_METHODS.map((method) => (
                  <MenuItem key={method} value={method}>
                    {method}
                  </MenuItem>
                ))}
              </TextField>
              <BindableEditor
                liveBinding={liveUrl}
                globalScope={queryScope}
                sx={{ flex: 1 }}
                server
                label="url"
                propType={{ type: 'string' }}
                renderControl={(props) => <UrlControl baseUrl={baseUrl} {...props} />}
                value={input.query.url}
                onChange={handleUrlChange}
              />
            </Box>
            <TabContext value={activeTab}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleActiveTabChange} aria-label="Fetch options active tab">
                  <Tab label="Parameters" value="parameters" />
                  <Tab label="Body" value="body" />
                  <Tab label="Headers" value="headers" />
                </TabList>
              </Box>
              <TabPanel disableGutters value="parameters">
                🚧 Under construction
              </TabPanel>
              <TabPanel disableGutters value="body">
                <BodyEditor
                  globalScope={globalScope}
                  value={input.params?.body}
                  onChange={handleBodyChange}
                />
              </TabPanel>
              <TabPanel disableGutters value="headers">
                🚧 Under construction
              </TabPanel>
            </TabContext>
            <TransformInput
              value={input.query.transform ?? 'return data;'}
              onChange={handleTransformChange}
              enabled={input.query.transformEnabled ?? false}
              onEnabledChange={handleTransformEnabledChange}
              globalScope={{ data: preview?.untransformedData }}
              loading={false}
            />
          </Stack>
        </QueryInputPanel>

        <SplitPane split="horizontal" size="30%" minSize={30} primary="second" allowResize>
          {preview?.error ? (
            <ErrorAlert error={preview?.error} />
          ) : (
            <JsonView sx={{ height: '100%' }} src={preview?.data} />
          )}
          <Devtools
            sx={{ width: '100%', height: '100%' }}
            har={previewHar}
            onHarClear={handleHarClear}
          />
        </SplitPane>
      </SplitPane>
    </QueryEditorShell>
  );
}

function getInitialQueryValue(): FetchQuery {
  return { url: { type: 'const', value: '' }, method: '', headers: [] };
}

const dataSource: ClientDataSource<{}, FetchQuery, FetchParams> = {
  displayName: 'Fetch',
  ConnectionParamsInput,
  QueryEditor,
  getInitialQueryValue,
  hasDefault: true,
};

export default dataSource;
