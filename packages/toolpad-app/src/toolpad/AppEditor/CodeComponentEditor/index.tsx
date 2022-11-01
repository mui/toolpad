import * as React from 'react';
import { Box, Button, Stack, styled, Toolbar, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import * as ReactDOM from 'react-dom';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import {
  NodeId,
  createComponent,
  ToolpadComponent,
  TOOLPAD_COMPONENT,
  ArgTypeDefinitions,
  ArgTypeDefinition,
} from '@mui/toolpad-core';
import { useQuery } from '@tanstack/react-query';
import invariant from 'invariant';
import * as appDom from '../../../appDom';
import { useDom, useDomApi } from '../../DomLoader';
import { tryFormat } from '../../../utils/prettier';
import useShortcut from '../../../utils/useShortcut';
import { usePrompt } from '../../../utils/router';
import NodeNameEditor from '../NodeNameEditor';
import usePageTitle from '../../../utils/usePageTitle';
import useLatest from '../../../utils/useLatest';
import AppThemeProvider from '../../../runtime/AppThemeProvider';
import useCodeComponent from './useCodeComponent';
import { filterValues, mapValues } from '../../../utils/collections';
import ErrorAlert from '../PageEditor/ErrorAlert';
import lazyComponent from '../../../utils/lazyComponent';
import CenteredSpinner from '../../../components/CenteredSpinner';
import SplitPane from '../../../components/SplitPane';
import { getDefaultControl } from '../../propertyControls';
import { WithControlledProp } from '../../../utils/types';
import useDebounced from '../../../utils/useDebounced';
import { ExtraLib } from '../../../components/MonacoEditor';

const TypescriptEditor = lazyComponent(() => import('../../../components/TypescriptEditor'), {
  noSsr: true,
  fallback: <CenteredSpinner />,
});

interface PropertyEditorProps extends WithControlledProp<any> {
  name: string;
  argType: ArgTypeDefinition;
}

function PropertyEditor({ argType, name, value, onChange }: PropertyEditorProps) {
  const Control = getDefaultControl(argType);
  if (!Control) {
    return null;
  }
  return <Control label={name} propType={argType.typeDef} value={value} onChange={onChange} />;
}

interface PropertiesEditorProps extends WithControlledProp<Record<string, any>> {
  argTypes: ArgTypeDefinitions;
}

function PropertiesEditor({ argTypes, value, onChange }: PropertiesEditorProps) {
  return (
    <Stack sx={{ p: 2, gap: 2, overflow: 'auto', height: '100%' }}>
      <Typography>Properties:</Typography>
      {Object.entries(argTypes).map(([name, argType]) => {
        invariant(argType, 'argType not defined');
        return (
          <ErrorBoundary key={name} fallback={<div>{name}</div>} resetKeys={[argType]}>
            <PropertyEditor
              name={name}
              argType={argType}
              value={value[name]}
              onChange={(newPropValue) => onChange({ ...value, [name]: newPropValue })}
            />
          </ErrorBoundary>
        );
      })}
    </Stack>
  );
}

const Noop = createComponent(() => null);

const CanvasFrame = styled('iframe')({
  border: 'none',
  position: 'absolute',
  width: '100%',
  height: '100%',
});

interface FrameContentProps {
  children: React.ReactElement;
  document: Document;
}

function FrameContent(props: FrameContentProps) {
  const { children, document } = props;

  const cache = React.useMemo(
    () =>
      createCache({
        key: `code-component-sandbox`,
        prepend: true,
        container: document.head,
      }),
    [document],
  );

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}

const EXTRA_LIBS_HTTP_MODULES: ExtraLib[] = [
  {
    content: `declare module "https://*";`,
  },
  {
    content: `declare module "@mui/icons-material/*";`,
  },
  {
    content: `declare module "@mui/icons-material";`,
  },
];

function RuntimeError({ error: runtimeError }: FallbackProps) {
  return <ErrorAlert error={runtimeError} />;
}

interface CodeComponentEditorContentProps {
  codeComponentNode: appDom.CodeComponentNode;
}

function CodeComponentEditorContent({ codeComponentNode }: CodeComponentEditorContentProps) {
  const domApi = useDomApi();
  const dom = useDom();

  const { data: typings } = useQuery<Record<string, string>>(['/typings.json'], async () => {
    return fetch('/typings.json').then((res) => res.json());
  });

  const extraLibs = React.useMemo(() => {
    if (typings) {
      return [
        ...Object.entries(typings).map(([path, content]) => ({
          content,
          filePath: `file:///${path}`,
        })),
        ...EXTRA_LIBS_HTTP_MODULES,
      ];
    }

    return EXTRA_LIBS_HTTP_MODULES;
  }, [typings]);

  const [input, setInput] = React.useState<string>(codeComponentNode.attributes.code.value);
  React.useEffect(
    () => setInput(codeComponentNode.attributes.code.value),
    [codeComponentNode.attributes.code.value],
  );

  const frameRef = React.useRef<HTMLIFrameElement>(null);

  usePageTitle(`${codeComponentNode.name} | Toolpad editor`);

  const handleSave = React.useCallback(() => {
    const pretty = tryFormat(input);
    setInput(pretty);
    domApi.setNodeNamespacedProp(
      codeComponentNode,
      'attributes',
      'code',
      appDom.createConst(pretty),
    );
  }, [codeComponentNode, domApi, input]);

  const allChangesAreCommitted = codeComponentNode.attributes.code.value === input;

  usePrompt(
    'Your code has unsaved changes. Are you sure you want to navigate away? All changes will be discarded.',
    !allChangesAreCommitted,
  );

  useShortcut({ code: 'KeyS', metaKey: true }, handleSave);

  const [iframeLoaded, onLoad] = React.useReducer(() => true, false);

  React.useEffect(() => {
    const document = frameRef.current?.contentDocument;
    // When we hydrate the iframe then the load event is already dispatched
    // once the iframe markup is parsed (maybe later but the important part is
    // that it happens before React can attach event listeners).
    // We need to check the readyState of the document once the iframe is mounted
    // and "replay" the missed load event.
    // See https://github.com/facebook/react/pull/13862 for ongoing effort in React
    // (though not with iframes in mind).
    if (document?.readyState === 'complete' && !iframeLoaded) {
      onLoad();
    }
  }, [iframeLoaded]);

  const frameDocument = frameRef.current?.contentDocument;

  const debouncedInput = useDebounced(input, 250);
  const { Component: GeneratedComponent, error: compileError } = useCodeComponent(debouncedInput);
  const CodeComponent: ToolpadComponent<any> = useLatest(GeneratedComponent) || Noop;

  const { argTypes = {} } = CodeComponent[TOOLPAD_COMPONENT];

  const defaultProps = React.useMemo(
    () => mapValues(argTypes, (argType) => argType?.defaultValue),
    [argTypes],
  );

  const [props, setProps] = React.useState({});

  return (
    <React.Fragment>
      <Stack sx={{ height: '100%' }}>
        <Toolbar sx={{ mt: 2, mb: 2 }}>
          <NodeNameEditor node={codeComponentNode} sx={{ maxWidth: 300 }} />
        </Toolbar>
        <Box flex={1}>
          <SplitPane split="vertical" allowResize size="50%">
            <TypescriptEditor
              value={input}
              onChange={(newValue) => setInput(newValue || '')}
              extraLibs={extraLibs}
            />

            <SplitPane split="horizontal" allowResize size="20%" primary="second">
              <CanvasFrame ref={frameRef} title="Code component sandbox" onLoad={onLoad} />
              <PropertiesEditor argTypes={argTypes} value={props} onChange={setProps} />
            </SplitPane>
          </SplitPane>
        </Box>
        <Toolbar
          sx={{
            justifyContent: 'end',
          }}
        >
          <Button disabled={allChangesAreCommitted} onClick={handleSave} variant="contained">
            Update
          </Button>
        </Toolbar>
      </Stack>
      {iframeLoaded && frameDocument
        ? ReactDOM.createPortal(
            <FrameContent document={frameDocument}>
              <React.Suspense fallback={null}>
                <ErrorBoundary resetKeys={[CodeComponent]} fallbackRender={RuntimeError}>
                  <AppThemeProvider dom={dom}>
                    <CodeComponent
                      {...defaultProps}
                      {...filterValues(props, (propValue) => typeof propValue !== 'undefined')}
                    />
                  </AppThemeProvider>
                </ErrorBoundary>
                {compileError ? <ErrorAlert error={compileError} /> : null}
              </React.Suspense>
            </FrameContent>,
            frameDocument.body,
          )
        : null}
    </React.Fragment>
  );
}

interface CodeComponentEditorProps {
  appId: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function CodeComponentEditor({ appId }: CodeComponentEditorProps) {
  const dom = useDom();
  const { nodeId } = useParams();
  const codeComponentNode = appDom.getMaybeNode(dom, nodeId as NodeId, 'codeComponent');
  return codeComponentNode ? (
    <CodeComponentEditorContent key={nodeId} codeComponentNode={codeComponentNode} />
  ) : (
    <Typography sx={{ p: 4 }}>Non-existing Code Component &quot;{nodeId}&quot;</Typography>
  );
}
