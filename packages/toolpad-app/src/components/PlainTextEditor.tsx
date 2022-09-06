/**
 * NOTE: This file can't SSR (use lazyComponent to load it)
 */

import * as React from 'react';
import MonacoEditor, { MonacoEditorProps } from './MonacoEditor';

export interface PlainTextEditorProps
  extends Omit<MonacoEditorProps, 'language' | 'diagnostics' | 'extraLibs' | 'compilerOptions'> {
  schemaUri?: string;
}

export default function PlainTextEditor({ schemaUri, ...props }: PlainTextEditorProps) {
  return <MonacoEditor language="plaintext" {...props} />;
}
