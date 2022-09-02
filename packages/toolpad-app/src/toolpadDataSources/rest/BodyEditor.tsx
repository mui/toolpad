import * as React from 'react';
import { Box, MenuItem, Skeleton, styled, TextField, Toolbar, ToolbarProps } from '@mui/material';
import { TabContext } from '@mui/lab';
import { BindableAttrValue, LiveBinding } from '@mui/toolpad-core';
import { Body, RawBody, UrlEncodedBody } from './types';
import { Maybe, WithControlledProp } from '../../utils/types';
import {
  useEvaluateLiveBinding,
  useEvaluateLiveBindingEntries,
} from '../../toolpad/AppEditor/useEvaluateLiveBinding';
import BindableEditor from '../../toolpad/AppEditor/PageEditor/BindableEditor';
import lazyComponent from '../../utils/lazyComponent';
import * as appDom from '../../appDom';
import TabPanel from '../../components/TabPanel';
import ParametersEditor from '../../toolpad/AppEditor/PageEditor/ParametersEditor';

interface ContentTypeSpec {
  alias: string;
  language: string;
}

const RAW_CONTENT_TYPES = new Map<string, ContentTypeSpec>([
  ['text/plain', { alias: 'text', language: 'plaintext' }],
  ['application/json', { alias: 'json', language: 'json' }],
  ['text/javascript', { alias: 'javascript', language: 'typescript' }],
  ['text/csv', { alias: 'csv', language: 'plaintext' }],
  ['text/html', { alias: 'html', language: 'html' }],
  ['text/css', { alias: 'css', language: 'css' }],
  ['application/xml', { alias: 'xml', language: 'plaintext' }],
]);

const BodyEditorToolbar = styled((props: ToolbarProps) => <Toolbar disableGutters {...props} />)(
  ({ theme }) => ({
    gap: theme.spacing(1),
  }),
);

const MonacoEditor = lazyComponent(() => import('../../components/MonacoEditor'), {
  noSsr: true,
  fallback: <Skeleton variant="rectangular" height="100%" />,
});

interface BodyTypeEditorProps<B = Body> extends WithControlledProp<Maybe<B>> {
  globalScope: Record<string, any>;
  toolbarActions?: React.ReactNode;
}

function RawBodyEditor({
  toolbarActions,
  value: valueProp,
  onChange,
  globalScope,
}: BodyTypeEditorProps<RawBody>) {
  const value: RawBody = React.useMemo(
    () =>
      valueProp ?? {
        kind: 'raw',
        contentType: appDom.createConst('text/plain'),
        content: appDom.createConst(''),
      },
    [valueProp],
  );

  const handleContentTypeChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...value, contentType: appDom.createConst(event.target.value) });
    },
    [onChange, value],
  );

  const handleValueChange = React.useCallback(
    (newContent: BindableAttrValue<string> | null) => {
      onChange({ ...value, content: newContent || appDom.createConst('') });
    },
    [onChange, value],
  );

  const content = value?.content ?? null;

  const liveContent: LiveBinding = useEvaluateLiveBinding({
    server: true,
    input: content,
    globalScope,
  });

  const { language = 'plaintext' } = RAW_CONTENT_TYPES.get(value.contentType.value) ?? {};

  return (
    <Box>
      <BodyEditorToolbar>
        {toolbarActions}
        <TextField select value={value?.contentType.value} onChange={handleContentTypeChange}>
          {Array.from(RAW_CONTENT_TYPES.entries(), ([contentType, { alias }]) => (
            <MenuItem key={contentType} value={contentType}>
              {alias}
            </MenuItem>
          ))}
        </TextField>
      </BodyEditorToolbar>
      <BindableEditor
        liveBinding={liveContent}
        globalScope={globalScope}
        propType={{ type: 'string' }}
        renderControl={(props) => (
          <MonacoEditor
            sx={{ flex: 1, height: 250 }}
            language={language}
            value={props.value}
            onChange={props.onChange}
            disabled={props.disabled}
          />
        )}
        value={value?.content || null}
        onChange={handleValueChange}
        label="json"
      />
    </Box>
  );
}

function UrlEncodedBodyEditor({
  toolbarActions,
  value: valueProp,
  onChange,
  globalScope,
}: BodyTypeEditorProps<UrlEncodedBody>) {
  const value: UrlEncodedBody = React.useMemo(
    () =>
      valueProp ?? {
        kind: 'urlEncoded',
        contentType: appDom.createConst('text/plain'),
        content: [],
      },
    [valueProp],
  );

  const handleParamsChange = React.useCallback(
    (newContent: [string, BindableAttrValue<any>][]) => {
      onChange({ ...value, content: newContent });
    },
    [onChange, value],
  );

  const liveContent = useEvaluateLiveBindingEntries({
    server: true,
    input: value.content,
    globalScope,
  });

  return (
    <Box>
      <BodyEditorToolbar>{toolbarActions}</BodyEditorToolbar>
      <ParametersEditor
        value={value.content}
        onChange={handleParamsChange}
        globalScope={globalScope}
        liveValue={liveContent}
      />
    </Box>
  );
}

type BodyKind = Body['kind'];

export interface BodyEditorProps extends WithControlledProp<Maybe<Body>> {
  globalScope: Record<string, any>;
}

export default function BodyEditor({ globalScope, value, onChange }: BodyEditorProps) {
  const [activeTab, setActiveTab] = React.useState<BodyKind>(value?.kind || 'raw');
  React.useEffect(() => setActiveTab(value?.kind || 'raw'), [value?.kind]);

  const handleTabChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setActiveTab(event.target.value as BodyKind);
  };

  const toolbarActions = (
    <React.Fragment>
      <TextField select value={activeTab} onChange={handleTabChange}>
        <MenuItem value="raw">raw</MenuItem>
        <MenuItem value="urlEncoded">x-www-form-urlencoded</MenuItem>
      </TextField>
    </React.Fragment>
  );

  return (
    <Box>
      <TabContext value={activeTab}>
        <TabPanel disableGutters value="raw">
          <RawBodyEditor
            toolbarActions={toolbarActions}
            globalScope={globalScope}
            value={value?.kind === 'raw' ? (value as RawBody) : null}
            onChange={onChange}
          />
        </TabPanel>
        <TabPanel disableGutters value="urlEncoded">
          <UrlEncodedBodyEditor
            toolbarActions={toolbarActions}
            globalScope={globalScope}
            value={value?.kind === 'urlEncoded' ? (value as UrlEncodedBody) : null}
            onChange={onChange}
          />
        </TabPanel>
      </TabContext>
    </Box>
  );
}
