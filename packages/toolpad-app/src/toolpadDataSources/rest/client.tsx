import * as React from 'react';
import { BindableAttrValue, LiveBinding } from '@mui/toolpad-core';
import { Button, InputAdornment, Stack, TextField, Toolbar, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
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
    (newValue: BindableAttrValue<string> | null) => {
      onChange({ ...value, url: newValue || { type: 'const', value: '' } });
    },
    [onChange, value],
  );

  const liveUrl: LiveBinding = useEvaluateLiveBinding({
    server: true,
    input: value.url,
    globalScope,
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
        value={value.url}
        onChange={handleUrlChange}
      />
    </div>
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
};

export default dataSource;
