import * as React from 'react';
import { Box, MenuItem, Skeleton, TextField, Toolbar } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import { BindableAttrValue, LiveBinding } from '@mui/toolpad-core';
import { Body, JsonBody, RawBody, UrlEncodedBody } from './types';
import { Maybe, WithControlledProp } from '../../utils/types';
import { useEvaluateLiveBinding } from '../../toolpad/AppEditor/useEvaluateLiveBinding';
import BindableEditor from '../../toolpad/AppEditor/PageEditor/BindableEditor';
import lazyComponent from '../../utils/lazyComponent';

const JsonEditor = lazyComponent(() => import('../../components/JsonEditor'), {
  noSsr: true,
  fallback: <Skeleton variant="rectangular" height="100%" />,
});

interface BodyEditorProps<B = Body> extends WithControlledProp<Maybe<B>> {
  globalScope: Record<string, any>;
}

function RawBodyEditor({ value, onChange, globalScope }: BodyEditorProps<RawBody>) {
  return null;
}

function UrlEncodedBodyEditor({ value, onChange, globalScope }: BodyEditorProps<UrlEncodedBody>) {
  return null;
}

function JsonBodyEditor({ value, onChange, globalScope }: BodyEditorProps<JsonBody>) {
  const handleValueChange = React.useCallback(
    (newContent: BindableAttrValue<any> | null) => {
      onChange(newContent ? { ...value, kind: 'json', content: newContent } : null);
    },
    [onChange, value],
  );

  const content = value?.content ?? null;

  const liveContent: LiveBinding = useEvaluateLiveBinding({
    input: content,
    globalScope,
  });

  return (
    <Box sx={{ height: 500 }}>
      <BindableEditor
        liveBinding={liveContent}
        globalScope={globalScope}
        propType={{ type: 'string' }}
        renderControl={(props) => (
          <JsonEditor sx={{ flex: 1, height: 250 }} value={props.value} onChange={props.onChange} />
        )}
        value={value?.content || null}
        onChange={handleValueChange}
        label="json"
      />
    </Box>
  );
}

type BodyKind = Body['kind'];

export default function BodyEditor({ globalScope, value, onChange }: BodyEditorProps) {
  const [activeTab, setActiveTab] = React.useState<BodyKind>(value?.kind || 'raw');
  React.useEffect(() => setActiveTab(value?.kind || 'raw'), [value]);

  const handleTabChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setActiveTab(event.target.value as BodyKind);
  };

  return (
    <Box>
      <TabContext value={activeTab}>
        <Toolbar sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TextField select value={activeTab} onChange={handleTabChange}>
            <MenuItem value="raw">raw</MenuItem>
            <MenuItem value="urlEncoded">x-www-form-urlencoded</MenuItem>
            <MenuItem value="json">json</MenuItem>
          </TextField>
        </Toolbar>
        <TabPanel value="raw">
          <RawBodyEditor
            globalScope={globalScope}
            value={value?.kind === 'raw' ? value : null}
            onChange={onChange}
          />
        </TabPanel>
        <TabPanel value="urlEncoded">
          <UrlEncodedBodyEditor
            globalScope={globalScope}
            value={value?.kind === 'urlEncoded' ? value : null}
            onChange={onChange}
          />
        </TabPanel>
        <TabPanel value="json">
          <JsonBodyEditor
            globalScope={globalScope}
            value={value?.kind === 'json' ? value : null}
            onChange={onChange}
          />
        </TabPanel>
      </TabContext>
    </Box>
  );
}
