/**
 * NOTE: This file can't SSR (use lazyComponent to load it)
 */

import * as React from 'react';
import type * as monaco from 'monaco-editor';
import MonacoEditor, { MonacoEditorProps } from './MonacoEditor';

export interface TypescriptEditorProps extends Omit<MonacoEditorProps, 'language' | 'diagnostics'> {
  value: string;
  onChange: (newValue: string) => void;
  functionBody?: boolean;
}

export default function TypescriptEditor({ functionBody, ...props }: TypescriptEditorProps) {
  const diagnostics = React.useMemo<monaco.languages.typescript.DiagnosticsOptions>(
    () => ({
      diagnosticCodesToIgnore: functionBody ? [1108] : [],
    }),
    [functionBody],
  );

  return <MonacoEditor language="typescript" diagnostics={diagnostics} {...props} />;
}
