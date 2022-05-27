import * as React from 'react';
import { Box, Button, Stack, styled, Toolbar, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import type * as monacoEditor from 'monaco-editor';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import ReactDOM from 'react-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { createComponent, ToolpadComponent, TOOLPAD_COMPONENT } from '@mui/toolpad-core';
import { NodeId } from '../../../types';
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
import { mapValues } from '../../../utils/collections';

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

interface CodeComponentEditorContentProps {
  theme?: appDom.ThemeNode;
  codeComponentNode: appDom.CodeComponentNode;
}

function CodeComponentEditorContent({ theme, codeComponentNode }: CodeComponentEditorContentProps) {
  const domApi = useDomApi();

  const [input, setInput] = React.useState<string>(codeComponentNode.attributes.code.value);

  const frameRef = React.useRef<HTMLIFrameElement>(null);

  const editorRef = React.useRef<monacoEditor.editor.IStandaloneCodeEditor>();

  usePageTitle(`${codeComponentNode.name} | Toolpad editor`);

  const updateInputExtern = React.useCallback((newInput: string) => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const model = editor.getModel();
    if (!model) {
      return;
    }

    // Used to restore cursor position
    const state = editorRef.current?.saveViewState();

    editor.executeEdits(null, [
      {
        range: model.getFullModelRange(),
        text: newInput,
      },
    ]);

    if (state) {
      editorRef.current?.restoreViewState(state);
    }
  }, []);

  const handleSave = React.useCallback(() => {
    const pretty = tryFormat(input);
    updateInputExtern(pretty);
    domApi.setNodeNamespacedProp(
      codeComponentNode,
      'attributes',
      'code',
      appDom.createConst(pretty),
    );
  }, [codeComponentNode, domApi, input, updateInputExtern]);

  const allChangesAreCommitted = codeComponentNode.attributes.code.value === input;

  usePrompt(
    'Your code has unsaved changes. Are you sure you want to navigate away? All changes will be discarded.',
    !allChangesAreCommitted,
  );

  useShortcut({ code: 'KeyS', metaKey: true }, handleSave);

  const HandleEditorMount = React.useCallback(
    (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
      editorRef.current = editor;

      editor.updateOptions({
        minimap: { enabled: false },
        accessibilitySupport: 'off',
      });

      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.Latest,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: 'React',
        allowJs: true,
        typeRoots: ['node_modules/@types'],
      });

      monaco.languages.typescript.typescriptDefaults.addExtraLib(`declare module "https://*";`);

      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });

      fetch('/typings.json')
        .then((res) => res.json())
        .then((typings) => {
          Array.from(Object.entries(typings)).forEach(([path, content]) => {
            monaco.languages.typescript.typescriptDefaults.addExtraLib(
              content as string,
              `file:///${path}`,
            );
          });
        })
        .catch((err) =>
          console.error(`Failed to initialize typescript types on editor: ${err.message}`),
        );
    },
    [],
  );

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

  const { Component: GeneratedComponent, error: compileError } = useCodeComponent(input);

  const CodeComponent: ToolpadComponent<any> = useLatest(GeneratedComponent) || Noop;
  const { argTypes } = CodeComponent[TOOLPAD_COMPONENT];

  const defaultProps = React.useMemo(
    () => mapValues(argTypes, (argType) => argType?.defaultValue),
    [argTypes],
  );

  return (
    <React.Fragment>
      <Stack sx={{ height: '100%' }}>
        <Toolbar variant="dense" sx={{ mt: 2 }}>
          <NodeNameEditor node={codeComponentNode} sx={{ maxWidth: 300 }} />
        </Toolbar>
        <Toolbar variant="dense">
          <Button disabled={allChangesAreCommitted} onClick={handleSave}>
            Update
          </Button>
        </Toolbar>
        <Box flex={1} display="flex">
          <Box flex={1}>
            <Editor
              height="100%"
              defaultValue={input}
              onChange={(newValue) => setInput(newValue || '')}
              path="./component.tsx"
              language="typescript"
              onMount={HandleEditorMount}
            />
          </Box>
          <Box sx={{ flex: 1, position: 'relative' }}>
            <CanvasFrame ref={frameRef} title="Code component sandbox" onLoad={onLoad} />
          </Box>
        </Box>
      </Stack>
      {iframeLoaded && frameDocument
        ? ReactDOM.createPortal(
            <FrameContent document={frameDocument}>
              <React.Suspense fallback={null}>
                <ErrorBoundary
                  resetKeys={[CodeComponent]}
                  fallbackRender={({ error: runtimeError }) => (
                    <React.Fragment>{runtimeError.message}</React.Fragment>
                  )}
                >
                  <AppThemeProvider node={theme}>
                    <CodeComponent {...defaultProps} />
                  </AppThemeProvider>
                </ErrorBoundary>
                {compileError?.message}
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
  const root = appDom.getApp(dom);
  const { themes = [] } = appDom.getChildNodes(dom, root);
  return codeComponentNode ? (
    <CodeComponentEditorContent
      key={nodeId}
      codeComponentNode={codeComponentNode}
      theme={themes[0]}
    />
  ) : (
    <Typography sx={{ p: 4 }}>Non-existing Code Component &quot;{nodeId}&quot;</Typography>
  );
}
