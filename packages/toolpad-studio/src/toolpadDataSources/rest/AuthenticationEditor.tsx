import * as React from 'react';
import { Grid, MenuItem, Stack, TextField } from '@mui/material';
import { Maybe, WithControlledProp } from '@mui/toolpad-utils/types';
import { ApiKeyAuth, Authentication, BasicAuth, BearerTokenAuth } from './types';

interface AuthMethodEditorProps<T> extends WithControlledProp<T> {
  disabled?: boolean;
}

function ApiKeyAuthEditor({ disabled, value, onChange }: AuthMethodEditorProps<ApiKeyAuth>) {
  return (
    <Stack gap={1}>
      <TextField
        disabled={disabled}
        label="header"
        value={value.header}
        onChange={(event) => onChange({ ...value, header: event.target.value })}
      />
      <TextField
        disabled={disabled}
        label="key"
        value={value.key}
        onChange={(event) => onChange({ ...value, key: event.target.value })}
      />
    </Stack>
  );
}
function BearerTokenAuthEditor({
  disabled,
  value,
  onChange,
}: AuthMethodEditorProps<BearerTokenAuth>) {
  return (
    <Stack gap={1}>
      <TextField
        disabled={disabled}
        label="token"
        value={value.token}
        onChange={(event) => onChange({ ...value, token: event.target.value })}
      />
    </Stack>
  );
}

function BasicAuthEditor({ disabled, value, onChange }: AuthMethodEditorProps<BasicAuth>) {
  return (
    <Stack gap={1}>
      <TextField
        disabled={disabled}
        label="user"
        value={value.user}
        onChange={(event) => onChange({ ...value, user: event.target.value })}
      />
      <TextField
        type="password"
        disabled={disabled}
        label="password"
        value={value.password}
        onChange={(event) => onChange({ ...value, password: event.target.value })}
      />
    </Stack>
  );
}

function AuthenticationDetailsEditor({ value, ...props }: AuthMethodEditorProps<Authentication>) {
  switch (value.type) {
    case 'basic':
      return <BasicAuthEditor value={value} {...props} />;
    case 'bearerToken':
      return <BearerTokenAuthEditor value={value} {...props} />;
    case 'apiKey':
      return <ApiKeyAuthEditor value={value} {...props} />;
    default:
      throw new Error(`Unsupported authentication type "${(value as Authentication).type}"`);
  }
}

function getInitialAuthenticationValue(type: string): Maybe<Authentication> {
  if (!type) {
    return null;
  }
  switch (type) {
    case 'basic':
      return { type, user: '', password: '' };
    case 'bearerToken':
      return { type, token: '' };
    case 'apiKey':
      return { type, header: '', key: '' };
    default:
      throw new Error(`Unsupported authentication type "${type}"`);
  }
}

export interface AuthenticationEditorProps extends WithControlledProp<Maybe<Authentication>> {
  disabled?: boolean;
}

export default function AuthenticationEditor({
  disabled,
  value,
  onChange,
}: AuthenticationEditorProps) {
  const handleTypeChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      onChange(getInitialAuthenticationValue(event.target.value));
    },
    [onChange],
  );

  return (
    <Grid container spacing={1}>
      <Grid item xs={4}>
        <TextField
          disabled={disabled}
          select
          label="authentication"
          value={value?.type || ''}
          onChange={handleTypeChange}
          fullWidth
        >
          <MenuItem value="">No authentication</MenuItem>
          <MenuItem value="basic">Basic</MenuItem>
          <MenuItem value="bearerToken">Bearer token</MenuItem>
          <MenuItem value="apiKey">API key</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={4}>
        {value ? (
          <AuthenticationDetailsEditor disabled={disabled} value={value} onChange={onChange} />
        ) : null}
      </Grid>
    </Grid>
  );
}
