/**
 * NOTE: This file can't SSR (use lazyComponent to load it)
 */

import * as React from 'react';
import type * as monaco from 'monaco-editor';
import MonacoEditor, { MonacoEditorProps } from './MonacoEditor';

export interface JsonEditorProps
  extends Omit<MonacoEditorProps, 'language' | 'diagnostics' | 'extraLibs' | 'compilerOptions'> {
  schemaUri?: string;
}

export default function JsonEditor({ schemaUri, ...props }: JsonEditorProps) {
  const diagnostics = React.useMemo<monaco.languages.json.DiagnosticsOptions>(
    () => ({
      validate: true,
      schemaRequest: 'error',
      enableSchemaRequest: true,
      schemas: schemaUri
        ? [
            {
              uri: new URL(schemaUri, window.location.href).href,
              fileMatch: ['*'],
            },
          ]
        : [],
    }),
    [schemaUri],
  );

  return <MonacoEditor language="json" diagnostics={diagnostics} {...props} />;
}
