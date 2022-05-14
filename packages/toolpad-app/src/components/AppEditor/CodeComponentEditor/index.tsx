import * as React from 'react';
import { Box, Button, Stack, styled, Toolbar, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import type * as monacoEditor from 'monaco-editor';
import { NodeId } from '../../../types';
import * as appDom from '../../../appDom';
import { useDom, useDomApi } from '../../DomLoader';
import getImportMap from '../../../getImportMap';
import { tryFormat } from '../../../utils/prettier';
import { HTML_ID_APP_ROOT, MUI_X_PRO_LICENSE } from '../../../constants';
import { escapeHtml } from '../../../utils/strings';
import useShortcut from '../../../utils/useShortcut';
import { usePrompt } from '../../../utils/router';
import NodeNameEditor from '../NodeNameEditor';

const CanvasFrame = styled('iframe')({
  border: 'none',
  position: 'absolute',
  width: '100%',
  height: '100%',
});

function renderSandboxHtml() {
  const importMap = getImportMap();
  const serializedImportMap = JSON.stringify(importMap, null, 2);
  const serializedPreload = Object.values(importMap.imports)
    .map((url) => `<link rel="modulepreload" href="${escapeHtml(url)}" />`)
    .join('\n');

  return `
    <!DOCTYPE html>
    <html style="position: relative">
      <head>
        <meta charset="utf-8" />
        <meta name="x-data-grid-pro-license" content="${MUI_X_PRO_LICENSE}" />
        <title>Toolpad</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          #${HTML_ID_APP_ROOT} {
            overflow: auto; /* prevents margins from collapsing into root */
            min-height: 100vh;
          }
        </style>
      </head>
      <body>
        <div id="${HTML_ID_APP_ROOT}"></div>

        <script type="importmap">
          ${serializedImportMap}
        </script>

        ${serializedPreload}

        <!-- ES Module Shims: Import maps polyfill for modules browsers without import maps support (all except Chrome 89+) -->
        <script async src="/web_modules/es-module-shims.js" type="module"></script>

        <script type="module" src="/runtime/codeComponentEditor.js"></script>
      </body>
    </html>
  `;
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

  const updateInputExtern = React.useCallback((newInput) => {
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

  React.useEffect(() => {
    const frameWindow = frameRef.current?.contentWindow;
    if (!frameWindow) {
      return;
    }

    // eslint-disable-next-line no-underscore-dangle
    if (frameWindow.__CODE_COMPONENT_SANDBOX_READY__) {
      // eslint-disable-next-line no-underscore-dangle
      frameRef.current?.contentWindow?.__CODE_COMPONENT_SANDBOX_BRIDGE__?.updateSandbox({
        src: input,
        theme,
      });
      // eslint-disable-next-line no-underscore-dangle
    } else if (typeof frameWindow.__CODE_COMPONENT_SANDBOX_READY__ !== 'function') {
      // eslint-disable-next-line no-underscore-dangle
      frameWindow.__CODE_COMPONENT_SANDBOX_READY__ = () => {
        // eslint-disable-next-line no-underscore-dangle
        frameRef.current?.contentWindow?.__CODE_COMPONENT_SANDBOX_BRIDGE__?.updateSandbox({
          src: input,
          theme,
        });
      };
    }
  }, [input, theme]);

  return (
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
          <CanvasFrame ref={frameRef} srcDoc={renderSandboxHtml()} title="hello" />
        </Box>
      </Box>
    </Stack>
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
