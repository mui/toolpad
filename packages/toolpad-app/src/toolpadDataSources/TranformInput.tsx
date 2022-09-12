import { Stack, Grid, Checkbox, FormControlLabel, IconButton, Tooltip } from '@mui/material';
import * as React from 'react';

import AutorenewIcon from '@mui/icons-material/Autorenew';
import JsonView from '../components/JsonView';
import { JsExpressionEditor } from '../toolpad/AppEditor/PageEditor/JsExpressionEditor';

export interface TransformInputProps {
  value: string;
  onChange: (newValue: string) => void;
  enabled: boolean;
  onEnabledChange: (newValue: boolean) => void;
  rawResponse: boolean;
  onRawResponseChange: (newValue: boolean) => void;
  globalScope: Record<string, any>;
  loading: boolean;
  onUpdatePreview?: () => void;
}

export default function TransformInput({
  value,
  onChange,
  enabled,
  onEnabledChange,
  rawResponse,
  onRawResponseChange,
  globalScope,
  loading,
  onUpdatePreview,
}: TransformInputProps) {
  const handleRawResponseChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onRawResponseChange(event.target.checked),
    [onRawResponseChange],
  );

  const handleTransformEnabledChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onEnabledChange(event.target.checked),
    [onEnabledChange],
  );

  return (
    <Grid item xs={6} md={12}>
      <Stack>
        <Stack direction="row" gap={1}>
          <FormControlLabel
            label="Transform response"
            control={
              <Checkbox
                checked={enabled}
                onChange={handleTransformEnabledChange}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            }
          />
          <Tooltip
            title="Check to avoid automatically parsing the response based on the content"
            describeChild
          >
            <FormControlLabel
              label="Use the raw response"
              control={
                <Checkbox
                  checked={rawResponse}
                  onChange={handleRawResponseChange}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              }
            />
          </Tooltip>
        </Stack>

        <Stack direction={'row'} spacing={2} width={'100%'}>
          <JsonView
            src={globalScope}
            disabled={loading || !enabled}
            sx={{
              width: '300px',
              maxWidth: '600px',
              maxHeight: '150px',
            }}
          />

          {onUpdatePreview ? (
            <IconButton
              disabled={!enabled}
              onClick={onUpdatePreview}
              sx={{ alignSelf: 'self-start' }}
            >
              <AutorenewIcon
                sx={{
                  animation: 'spin 1500ms linear infinite',
                  animationPlayState: loading ? 'running' : 'paused',
                  '@keyframes spin': {
                    '0%': {
                      transform: 'rotate(0deg)',
                    },
                    '100%': {
                      transform: 'rotate(360deg)',
                    },
                  },
                }}
                fontSize="inherit"
              />
            </IconButton>
          ) : null}
          <JsExpressionEditor
            globalScope={globalScope}
            autoFocus
            value={value}
            sx={{
              minWidth: '300px',
              flex: 1,
            }}
            functionBody
            onChange={onChange}
            disabled={!enabled || loading}
          />
        </Stack>
      </Stack>
    </Grid>
  );
}
