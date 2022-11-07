/* eslint-disable react/no-unused-prop-types */
/**
 * NOTE: This file can't SSR (use lazyComponent to load it)
 */
import '../utils/browserOnly';

import * as React from 'react';
import type * as monaco from 'monaco-editor';
import { SxProps } from '@mui/material';

export interface ExtraLib {
  content: string;
  filePath?: string;
}

export interface MonacoEditorHandle {
  editor: monaco.editor.IStandaloneCodeEditor;
  monaco: typeof monaco;
}

type EditorOptions = monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions;

interface MonacoEditorBaseProps {
  value?: string;
  onChange?: (newValue: string) => void;
  disabled?: boolean;
  sx?: SxProps;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  options?: EditorOptions;
  className?: string;
}

export type MonacoEditorProps = MonacoEditorBaseProps &
  (
    | {
        language: 'typescript';
        diagnostics?: monaco.languages.typescript.DiagnosticsOptions;
        compilerOptions?: monaco.languages.typescript.CompilerOptions | undefined;
        extraLibs?: ExtraLib[];
      }
    | {
        language: 'json';
        diagnostics?: monaco.languages.json.DiagnosticsOptions;
        compilerOptions?: undefined;
        extraLibs?: undefined;
      }
    | {
        language?: string | undefined;
        diagnostics?: undefined;
        compilerOptions?: undefined;
        extraLibs?: undefined;
      }
  );

export default React.forwardRef<MonacoEditorHandle, MonacoEditorProps>(function MonacoEditor(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  props,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ref,
) {
  return null;
});
