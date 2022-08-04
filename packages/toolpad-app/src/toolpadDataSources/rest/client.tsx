import * as React from 'react';
import { BindableAttrValue, BindableAttrValues, LiveBinding } from '@mui/toolpad-core';
import {
  Box,
  Button,
  Divider,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { ClientDataSource, ConnectionEditorProps, QueryEditorProps } from '../../types';
import { FetchQuery, RestConnectionParams } from './types';
import { getAuthenticationHeaders, parseBaseUrl } from './shared';
import BindableEditor, {
  RenderControlParams,
} from '../../toolpad/AppEditor/PageEditor/BindableEditor';
import { useEvaluateLiveBinding } from '../../toolpad/AppEditor/useEvaluateLiveBinding';
import MapEntriesEditor from '../../components/MapEntriesEditor';
import { Maybe } from '../../utils/types';
import AuthenticationEditor from './AuthenticationEditor';
import { isSaveDisabled, validation } from '../../utils/forms';
import * as appDom from '../../appDom';
import ParametersEditor from '../../toolpad/AppEditor/PageEditor/ParametersEditor';
import { mapValues } from '../../utils/collections';

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

function QueryEditor({
  globalScope,
  connectionParams,
  liveParams,
  value,
  onChange,
}: QueryEditorProps<RestConnectionParams, FetchQuery>) {
  const baseUrl = connectionParams?.baseUrl;

  const handleUrlChange = React.useCallback(
    (newUrl: BindableAttrValue<string> | null) => {
      const query: FetchQuery = {
        ...value.query,
        url: newUrl || appDom.createConst(''),
      };
      onChange({ ...value, query });
    },
    [onChange, value],
  );

  const handleMethodChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const query: FetchQuery = {
        ...value.query,
        method: event.target.value,
      };
      onChange({ ...value, query });
    },
    [onChange, value],
  );

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

  const queryScope = {
    query: mapValues(liveParams, (bindingResult) => bindingResult.value),
  };

  const liveUrl: LiveBinding = useEvaluateLiveBinding({
    server: true,
    input: value.query.url,
    globalScope: queryScope,
  });

  return (
    <Stack gap={2} sx={{ px: 3, pt: 1 }}>
      <Typography>Parameters</Typography>
      <ParametersEditor
        value={params}
        onChange={handleParamsChange}
        globalScope={globalScope}
        liveValue={paramsEditorLiveValue}
      />
      <Divider />
      <Typography>Query</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
        <TextField select value={value.query.method || 'GET'} onChange={handleMethodChange}>
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
          value={value.query.url}
          onChange={handleUrlChange}
        />
      </Box>
    </Stack>
  );
}

function getInitialQueryValue(): FetchQuery {
  return { url: { type: 'const', value: '' }, method: '', headers: [] };
}

const dataSource: ClientDataSource<{}, FetchQuery> = {
  displayName: 'Fetch',
  ConnectionParamsInput,
  isConnectionValid: () => true,
  QueryEditor,
  getInitialQueryValue,
  hasDefault: true,
};

export default dataSource;
