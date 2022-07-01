/**
 * NOTE: This file can't SSR (use reactLazyNoSsr to load it)
 */

import * as React from 'react';
import * as monaco from 'monaco-editor';
import { styled, SxProps } from '@mui/material';

(globalThis as any).MonacoEnvironment = {
  getWorkerUrl(_, label) {
    if (label === 'typescript') {
      return `/_next/static/ts.worker.js`;
    }
    if (label === 'json') {
      return `/_next/static/json.worker.js`;
    }
    if (label === 'html') {
      return `/_next/static/html.worker.js`;
    }
    if (label === 'css') {
      return `/_next/static/css.worker.js`;
    }
    if (label === 'editorWorkerService') {
      return '/_next/static/editor.worker.js';
    }
    throw new Error(`Failed to provide a worker URL for label "${label}"`);
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
  sx?: SxProps;
  value?: string;
  onChange?: (newValue: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  language?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  options?: EditorOptions;
}

export default React.forwardRef<MonacoEditorHandle, MonacoEditorProps>(function MonacoEditor(
  { sx, value, onChange, language = 'typescript', onFocus, onBlur, disabled, options, autoFocus },
  ref,
) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const instanceRef = React.useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  React.useEffect(() => {
    if (!rootRef.current) {
      return;
    }

    const combinedOptions: EditorOptions = {
      readOnly: disabled,
      ...options,
    };

    if (instanceRef.current) {
      if (combinedOptions) {
        instanceRef.current.updateOptions(combinedOptions);
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
      instanceRef.current = monaco.editor.create(rootRef.current, {
        value,
        language,
        minimap: { enabled: false },
        accessibilitySupport: 'off',
        tabSize: 2,
        ...combinedOptions,
      });

      if (autoFocus && !disabled) {
        instanceRef.current.focus();
      }
    }
  }, [language, value, options, disabled, autoFocus]);

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
      instanceRef.current?.getModel()?.dispose();
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
