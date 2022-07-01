/**
 * NOTE: This file can't SSR (use reactLazyNoSsr to load it)
 */

import * as React from 'react';
import MonacoEditor, { MonacoEditorHandle, MonacoEditorProps } from './MonacoEditor';

export interface TypescriptEditorProps extends Omit<MonacoEditorProps, 'language'> {
  value: string;
  onChange: (newValue: string) => void;
  extraLibs?: { content: string; filePath?: string }[];
  functionBody?: boolean;
}

export default function TypescriptEditor({
  extraLibs,
  functionBody,
  ...props
}: TypescriptEditorProps) {
  const editorRef = React.useRef<MonacoEditorHandle>(null);

  React.useEffect(() => {
    editorRef.current?.monaco.languages.typescript.typescriptDefaults.setExtraLibs(extraLibs || []);
  }, [extraLibs]);

  React.useEffect(() => {
    editorRef.current?.monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      diagnosticCodesToIgnore: functionBody ? [1108] : [],
    });
  }, [functionBody]);

  return <MonacoEditor ref={editorRef} language="typescript" {...props} />;
}
