import * as React from 'react';
import { ArgTypeDefinitions, BindableAttrValue, LiveBinding } from '@mui/toolpad-core';
import { Button, InputAdornment, Stack, TextField, Toolbar, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import StringRecordEditor from '../../components/StringRecordEditor';
import { ClientDataSource, ConnectionEditorProps, QueryEditorProps } from '../../types';
import { FetchQuery, RestConnectionParams } from './types';
import { getAuthenticationHeaders, parseBaseUrl } from './shared';
import BindableEditor, {
  RenderControlParams,
} from '../../components/AppEditor/PageEditor/BindableEditor';
import { useEvaluateLiveBinding } from '../../components/AppEditor/useEvaluateLiveBinding';
import MapEntriesEditor from '../../components/MapEntriesEditor';
import { Maybe } from '../../utils/types';
import AuthenticationEditor from './AuthenticationEditor';
import { isSaveDisabled, validation } from '../../utils/forms';
import * as appDom from '../../appDom';

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
    <Stack direction="column" gap={1}>
      <Toolbar disableGutters>
        <Button onClick={doSubmit} disabled={isSaveDisabled(formState)}>
          Save
        </Button>
      </Toolbar>
      <Stack gap={3}>
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
          render={({
            field: { value: fieldValue = [], onChange: onFieldChange, ref, ...field },
          }) => {
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
            <AuthenticationEditor
              {...field}
              disabled={!headersAllowed}
              value={fieldValue ?? null}
            />
          )}
        />
      </Stack>
    </Stack>
  );
}

function QueryEditor({
  globalScope,
  connectionParams,
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

  const handleApiQueryChange = React.useCallback(
    (newValue: Record<string, string>) => {
      const query: FetchQuery = {
        ...value.query,
        params: newValue,
      };
      onChange({ ...value, query });
    },
    [onChange, value],
  );

  const liveUrl: LiveBinding = useEvaluateLiveBinding({
    server: true,
    input: value.query.url,
    globalScope: globalScope.query ? globalScope : { query: value.params },
  });

  return (
    <div>
      <BindableEditor
        liveBinding={liveUrl}
        globalScope={globalScope}
        server
        label="url"
        propType={{ type: 'string' }}
        renderControl={(params) => {
          return <UrlControl baseUrl={baseUrl} {...params} />;
        }}
        value={value.query.url}
        onChange={handleUrlChange}
      />
      {/* TODO: remove this when QueryStateNode is removed */}
      {globalScope.query ? null : (
        <StringRecordEditor
          label="api query"
          fieldLabel="parameter"
          valueLabel="default value"
          value={value.query.params || {}}
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
