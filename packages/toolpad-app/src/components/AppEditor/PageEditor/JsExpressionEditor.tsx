import * as React from 'react';
import Editor from '@monaco-editor/react';
import type * as monacoEditor from 'monaco-editor';
import jsonToTs from 'json-to-ts';
import { styled } from '@mui/material';
import { WithControlledProp } from '../../../utils/types';

const JsExpressionEditorRoot = styled('div')(({ theme }) => ({
  border: '1px solid black',
  borderColor: theme.palette.divider,
  borderRadius: theme.shape.borderRadius,
  // overflow: 'hidden',
}));

export interface JsExpressionEditorProps extends WithControlledProp<string> {
  globalScope: Record<string, unknown>;
  onCommit?: () => void;
}

export function JsExpressionEditor({
  onCommit,
  value,
  onChange,
  globalScope,
}: JsExpressionEditorProps) {
  const editorRef = React.useRef<monacoEditor.editor.IStandaloneCodeEditor>();
  const monacoRef = React.useRef<typeof monacoEditor>();

  const libSource = React.useMemo(() => {
    const type = jsonToTs(globalScope);

    const globals = Object.keys(globalScope)
      .map((key) => `declare const ${key}: RootObject[${JSON.stringify(key)}];`)
      .join('\n');

    return `
      ${type.join('\n')}

      ${globals}
    `;
  }, [globalScope]);

  const libSourceDisposable = React.useRef<monacoEditor.IDisposable>();
  const setLibSource = React.useCallback(() => {
    libSourceDisposable.current?.dispose();
    if (monacoRef.current) {
      libSourceDisposable.current =
        monacoRef.current.languages.typescript.typescriptDefaults.addExtraLib(
          libSource,
          'file:///node_modules/@mui/toolpad/index.d.ts',
        );
    }
  }, [libSource]);
  React.useEffect(() => () => libSourceDisposable.current?.dispose(), []);

  React.useEffect(() => setLibSource(), [setLibSource]);

  const HandleEditorMount = React.useCallback(
    (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
      monacoRef.current = monaco;
      editorRef.current = editor;

      editor.updateOptions({
        minimap: { enabled: false },
        accessibilitySupport: 'off',
        fixedOverflowWidgets: true,
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
      editor.addCommand(monaco.KeyMod.CtrlCmd | (monaco.KeyCode as any).KEY_S, () => onCommit?.());

      editor.focus();

      setLibSource();
    },
    [setLibSource, onCommit],
  );

  return (
    <JsExpressionEditorRoot>
      <Editor
        height="150px"
        value={value}
        onChange={(code = '') => onChange(code)}
        path="./component.tsx"
        language="typescript"
        onMount={HandleEditorMount}
      />
    </JsExpressionEditorRoot>
  );
}
