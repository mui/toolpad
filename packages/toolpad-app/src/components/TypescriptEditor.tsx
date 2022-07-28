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
  topLevelAwait?: boolean;
}

export default function TypescriptEditor({
  functionBody,
  topLevelAwait,
  ...props
}: TypescriptEditorProps) {
  const diagnostics = React.useMemo<monaco.languages.typescript.DiagnosticsOptions>(() => {
    const diagnosticCodesToIgnore: number[] = [];
    if (functionBody) {
      // TS1108: A 'return' statement can only be used within a function body.
      diagnosticCodesToIgnore.push(1108);
    }
    if (topLevelAwait) {
      // TS1375: 'await' expressions are only allowed at the top level of a file when that file is a module,
      // but this file has no imports or exports. Consider adding an empty 'export {}' to make this file a module.
      diagnosticCodesToIgnore.push(1375);
    }
    return { diagnosticCodesToIgnore };
  }, [functionBody, topLevelAwait]);

  return <MonacoEditor language="typescript" diagnostics={diagnostics} {...props} />;
}
