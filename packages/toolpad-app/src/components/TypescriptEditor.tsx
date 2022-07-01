/**
 * NOTE: This file can't SSR (use reactLazyNoSsr to load it)
 */

import * as React from 'react';
import MonacoEditor, { MonacoEditorHandle } from './MonacoEditor';

export interface TypescriptEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  extraLibs?: { content: string; filePath?: string }[];
  onFocus?: () => void;
  onBlur?: () => void;
  functionBody?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function TypescriptEditor({
  value,
  onChange,
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

  return (
    <MonacoEditor
      ref={editorRef}
      value={value}
      onChange={onChange}
      language="typescript"
      {...props}
    />
  );
}
