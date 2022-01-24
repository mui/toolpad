import * as React from 'react';
import { Box, Button, Stack, styled, Toolbar } from '@mui/material';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import type * as monacoEditor from 'monaco-editor';
import { NodeId } from '../../../types';
import * as studioDom from '../../../studioDom';
import { useDom, useDomApi } from '../../DomProvider';
import defs from './reactDefs';
import StudioSandbox from '../../StudioSandbox';
import getImportMap from '../../../getImportMap';
import renderThemeCode from '../../../renderThemeCode';
import renderEntryPoint from '../../../renderPageEntryCode';

const ComponentSandbox = styled(StudioSandbox)({
  height: '100%',
});

interface CodeComponentEditorContentProps {
  nodeId: NodeId;
}

function CodeComponentEditorContent({ nodeId }: CodeComponentEditorContentProps) {
  const dom = useDom();
  const domApi = useDomApi();
  const domNode = studioDom.getNode(dom, nodeId);
  studioDom.assertIsCodeComponent(domNode);

  const [input, setInput] = React.useState(domNode.code);

  const editorRef = React.useRef<monacoEditor.editor.IStandaloneCodeEditor>();
  const HandleEditorMount = React.useCallback(
    (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
      editorRef.current = editor;

      editor.updateOptions({
        minimap: { enabled: false },
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

      // TODO: We must figure this out better
      //       We must create a more sustainable way to load definition files.
      //       look into: https://github.com/lukasbach/monaco-editor-auto-typings
      //       but probably not the greatest solution:
      //         - how to version packages?
      //         - We should rather load it from our own webserver.
      //         - Can we bundle .d.ts files somehow and host that statically?
      //         - no @mui/material support. See
      //             - https://github.com/lukasbach/monaco-editor-auto-typings/issues/7
      //             - https://github.com/microsoft/monaco-editor/issues/2295
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        defs,
        `file:///node_modules/@types/react/index.d.ts`,
      );
    },
    [],
  );

  const themePath = './lib/theme.ts';
  const entryPath = `./entry.tsx`;
  const componentPath = `./components/${domNode.id}.tsx`;

  const renderedTheme = React.useMemo(() => {
    return renderThemeCode(dom, { editor: true });
  }, [dom]);

  const renderedEntrypoint = React.useMemo(() => {
    return renderEntryPoint({
      pagePath: componentPath,
      themePath,
      editor: true,
    });
  }, [componentPath, themePath]);

  return (
    <Stack sx={{ height: '100%' }}>
      <Toolbar>
        <Button
          onClick={() => {
            domApi.setNodeAttribute<studioDom.StudioCodeComponentNode, 'code'>(
              domNode,
              'code',
              input,
            );
          }}
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
          <ComponentSandbox
            base={`/components/${domNode.id}/`}
            importMap={getImportMap()}
            files={{
              [componentPath]: { code: input },
              [themePath]: { code: renderedTheme.code },
              [entryPath]: { code: renderedEntrypoint.code },
            }}
            entry={entryPath}
          />
        </Box>
      </Box>
    </Stack>
  );
}

interface CodeComponentEditorProps {
  className?: string;
}

export default function CodeComponentEditor({ className }: CodeComponentEditorProps) {
  const { nodeId } = useParams();
  return (
    <Box className={className}>
      <CodeComponentEditorContent key={nodeId} nodeId={nodeId as NodeId} />
    </Box>
  );
}
