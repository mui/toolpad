import * as React from 'react';
import { Grid, MenuItem, Stack, TextField } from '@mui/material';
import { ApiKeyAuth, Authentication, BasicAuth, BearerTokenAuth } from './types';
import { Maybe, WithControlledProp } from '../../utils/types';

interface ApiKeyAuthEditorProps extends WithControlledProp<ApiKeyAuth> {}

function ApiKeyAuthEditor({ value, onChange }: ApiKeyAuthEditorProps) {
  return (
    <Stack gap={1}>
      <TextField
        label="header"
        value={value.header}
        onChange={(event) => onChange({ ...value, header: event.target.value })}
      />
      <TextField
        label="key"
        value={value.key}
        onChange={(event) => onChange({ ...value, key: event.target.value })}
      />
    </Stack>
  );
}

interface BearerTokenAuthEditorProps extends WithControlledProp<BearerTokenAuth> {}

function BearerTokenAuthEditor({ value, onChange }: BearerTokenAuthEditorProps) {
  return (
    <Stack gap={1}>
      <TextField
        label="token"
        value={value.token}
        onChange={(event) => onChange({ ...value, token: event.target.value })}
      />
    </Stack>
  );
}

interface BasicAuthEditorProps extends WithControlledProp<BasicAuth> {}

function BasicAuthEditor({ value, onChange }: BasicAuthEditorProps) {
  return (
    <Stack gap={1}>
      <TextField
        label="user"
        value={value.user}
        onChange={(event) => onChange({ ...value, user: event.target.value })}
      />
      <TextField
        label="password"
        value={value.password}
        onChange={(event) => onChange({ ...value, password: event.target.value })}
      />
    </Stack>
  );
}

interface AuthenticationDetailsEditorProps extends WithControlledProp<Authentication> {}

function AuthenticationDetailsEditor({ value, ...props }: AuthenticationDetailsEditorProps) {
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

export interface AuthenticationEditorProps extends WithControlledProp<Maybe<Authentication>> {}

export default function AuthenticationEditor({ value, onChange }: AuthenticationEditorProps) {
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
        {value ? <AuthenticationDetailsEditor value={value} onChange={onChange} /> : null}
      </Grid>
    </Grid>
  );
}
