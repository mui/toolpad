import * as React from 'react';
import { Box, Button, Stack, styled, Toolbar, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import type * as monacoEditor from 'monaco-editor';
import { transform } from 'sucrase';
import { NodeId } from '../../../types';
import * as appDom from '../../../appDom';
import { useDom, useDomApi } from '../../DomLoader';
import getImportMap from '../../../getImportMap';
import { tryFormat } from '../../../utils/prettier';
import { HTML_ID_APP_ROOT, MUI_X_PRO_LICENSE } from '../../../constants';
import { escapeHtml } from '../../../utils/strings';

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
            overflow: hidden; /* prevents margins from collapsing into root */
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
  codeComponentNode: appDom.CodeComponentNode;
}

function CodeComponentEditorContent({ codeComponentNode }: CodeComponentEditorContentProps) {
  const domApi = useDomApi();

  const [input, setInput] = React.useState(codeComponentNode.attributes.code.value);

  const frameRef = React.useRef<HTMLIFrameElement>(null);

  const updateDomActionRef = React.useRef(() => {});

  React.useEffect(() => {
    updateDomActionRef.current = () => {
      const pretty = tryFormat(input);
      setInput(pretty);
      domApi.setNodeNamespacedProp(
        codeComponentNode,
        'attributes',
        'code',
        appDom.createConst(pretty),
      );
    };
  }, [domApi, codeComponentNode, input]);

  const editorRef = React.useRef<monacoEditor.editor.IStandaloneCodeEditor>();
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

      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });

      // The types for `monaco.KeyCode` seem to be messed up
      // eslint-disable-next-line no-bitwise
      editor.addCommand(monaco.KeyMod.CtrlCmd | (monaco.KeyCode as any).KEY_S, () => {
        updateDomActionRef.current();
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

    let compiled: string;
    try {
      compiled = transform(input, {
        transforms: ['jsx', 'typescript'],
      }).code;
    } catch (err) {
      console.error(err);
      return;
    }

    // eslint-disable-next-line no-underscore-dangle
    if (frameWindow.__CODE_COMPONENT_SANDBOX_READY__) {
      // eslint-disable-next-line no-underscore-dangle
      frameRef.current?.contentWindow?.__CODE_COMPONENT_SANDBOX_BRIDGE__?.updateCodeCompoent(
        compiled,
      );
      // eslint-disable-next-line no-underscore-dangle
    } else if (typeof frameWindow.__CODE_COMPONENT_SANDBOX_READY__ !== 'function') {
      // eslint-disable-next-line no-underscore-dangle
      frameWindow.__CODE_COMPONENT_SANDBOX_READY__ = () => {
        // eslint-disable-next-line no-underscore-dangle
        frameRef.current?.contentWindow?.__CODE_COMPONENT_SANDBOX_BRIDGE__?.updateCodeCompoent(
          compiled,
        );
      };
    }
  }, [input]);

  return (
    <Stack sx={{ height: '100%' }}>
      <Toolbar>
        <Button
          disabled={codeComponentNode.attributes.code.value === input}
          onClick={() => updateDomActionRef.current()}
        >
          Update
        </Button>
      </Toolbar>
      <Box flex={1} display="flex">
        <Box flex={1}>
          <Editor
            height="100%"
            value={input}
            onChange={(newValue) => setInput(newValue || '')}
            path="./component.tsx"
            language="typescript"
            onMount={HandleEditorMount}
          />
        </Box>
        <Box flex={1}>
          <CanvasFrame ref={frameRef} srcDoc={renderSandboxHtml()} title="hello" />
        </Box>
      </Box>
    </Stack>
  );
}

interface CodeComponentEditorProps {
  className?: string;
}

export default function CodeComponentEditor({ className }: CodeComponentEditorProps) {
  const dom = useDom();
  const { nodeId } = useParams();
  const codeComponentNode = appDom.getMaybeNode(dom, nodeId as NodeId, 'codeComponent');
  return (
    <Box className={className}>
      {codeComponentNode ? (
        <CodeComponentEditorContent key={nodeId} codeComponentNode={codeComponentNode} />
      ) : (
        <Typography sx={{ p: 4 }}>Non-existing Code Component &quot;{nodeId}&quot;</Typography>
      )}
    </Box>
  );
}
