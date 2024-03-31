/**
 * NOTE: This file can't SSR (use lazyComponent to load it)
 */

import * as React from 'react';
import MonacoEditor, { MonacoEditorProps } from './MonacoEditor';

export interface MdEditorProps
  extends Omit<MonacoEditorProps, 'language' | 'diagnostics' | 'extraLibs' | 'compilerOptions'> {}

export default function MdEditor(props: MdEditorProps) {
  return <MonacoEditor language="markdown" {...props} />;
}
