/**
 * NOTE: This file can't SSR (use reactLazyNoSsr to load it)
 */

import * as React from 'react';
import * as monaco from 'monaco-editor';
import { styled, SxProps } from '@mui/material';

(globalThis as any).MonacoEnvironment = {
  async getWorker(_, label) {
    if (label === 'typescript') {
      return new Worker(
        new URL(`monaco-editor/esm/vs/language/typescript/ts.worker`, import.meta.url),
      );
    }
    if (label === 'json') {
      return new Worker(new URL(`monaco-editor/esm/vs/language/json/json.worker`, import.meta.url));
    }
    if (label === 'html') {
      return new Worker(new URL(`monaco-editor/esm/vs/language/html/html.worker`, import.meta.url));
    }
    if (label === 'css') {
      return new Worker(new URL(`monaco-editor/esm/vs/language/css/css.worker`, import.meta.url));
    }
    if (label === 'editorWorkerService') {
      return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url));
    }
    throw new Error(`Failed to resolve worker with label "${label}"`);
  },
} as monaco.Environment;

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

const EditorRoot = styled('div')({ height: '100%' });

export interface MonacoEditorHandle {
  editor: monaco.editor.IStandaloneCodeEditor;
  monaco: typeof monaco;
}

type EditorOptions = monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions;

export interface MonacoEditorProps {
  path: string;
  value?: string;
  onChange?: (newValue: string) => void;
  disabled?: boolean;
  sx?: SxProps;
  autoFocus?: boolean;
  language?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  options?: EditorOptions;
}

export default React.forwardRef<MonacoEditorHandle, MonacoEditorProps>(function MonacoEditor(
  {
    path,
    value,
    onChange,
    sx,
    language = 'typescript',
    onFocus,
    onBlur,
    disabled,
    options,
    autoFocus,
  },
  ref,
) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const instanceRef = React.useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  React.useEffect(() => {
    if (!rootRef.current) {
      return;
    }

    const extraOptions: EditorOptions = {
      readOnly: disabled,
      ...options,
    };

    if (instanceRef.current) {
      if (extraOptions) {
        instanceRef.current.updateOptions(extraOptions);
      }

      const model = instanceRef.current.getModel();
      if (typeof value === 'string' && model) {
        const actualValue = model.getValue();

        if (value !== actualValue) {
          // Used to restore cursor position
          const state = instanceRef.current.saveViewState();

          instanceRef.current.executeEdits(null, [
            {
              range: model.getFullModelRange(),
              text: value,
            },
          ]);

          if (state) {
            instanceRef.current.restoreViewState(state);
          }
        }
      }
    } else {
      const pathUri = monaco.Uri.parse(path);
      const model =
        monaco.editor.getModel(pathUri) ||
        monaco.editor.createModel(value || '', language, pathUri);

      instanceRef.current = monaco.editor.create(rootRef.current, {
        model,
        language,
        minimap: { enabled: false },
        accessibilitySupport: 'off',
        tabSize: 2,
        ...extraOptions,
      });

      if (autoFocus && !disabled) {
        instanceRef.current.focus();
      }
    }
  }, [language, value, options, disabled, autoFocus, path]);

  React.useEffect(() => {
    const editor = instanceRef.current;

    const onDidChangeModelContentSub = editor?.onDidChangeModelContent(() => {
      const editorValue = editor.getValue();

      if (onChange && value !== editorValue) {
        onChange(editorValue);
      }
    });

    return () => onDidChangeModelContentSub?.dispose();
  }, [onChange, value]);

  React.useEffect(() => {
    const editor = instanceRef.current;

    if (onFocus) {
      const onDidFocusEditorTextSub = editor?.onDidFocusEditorText(onFocus);
      return () => onDidFocusEditorTextSub?.dispose();
    }
    return () => {};
  }, [onFocus]);

  React.useEffect(() => {
    const editor = instanceRef.current;
    if (onBlur) {
      const onDidBlurEditorTextSub = editor?.onDidBlurEditorText(onBlur);
      return () => onDidBlurEditorTextSub?.dispose();
    }
    return () => {};
  }, [onBlur]);

  React.useEffect(() => {
    return () => {
      instanceRef.current?.dispose();
      instanceRef.current = null;
    };
  }, []);

  React.useImperativeHandle(
    ref,
    () => {
      return {
        get editor() {
          const editor = instanceRef.current;
          if (!editor) {
            throw new Error('Editor not created yet');
          }
          return editor;
        },
        get monaco() {
          return monaco;
        },
      };
    },
    [],
  );

  return (
    <EditorRoot
      sx={{ ...sx, ...(disabled ? { opacity: 0.5, pointerEvents: 'none' } : {}) }}
      ref={rootRef}
    />
  );
});
