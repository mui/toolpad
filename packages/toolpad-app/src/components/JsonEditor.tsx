/**
 * NOTE: This file can't SSR (use lazyComponent to load it)
 */

import * as React from 'react';
import MonacoEditor, { MonacoEditorHandle, MonacoEditorProps } from './MonacoEditor';

export interface JsonEditorProps extends Omit<MonacoEditorProps, 'language'> {
  schemaUri?: string;
}

export default function JsonEditor({ schemaUri, ...props }: JsonEditorProps) {
  const editorRef = React.useRef<MonacoEditorHandle>(null);

  React.useEffect(() => {
    editorRef.current?.monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
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
    });
  }, [schemaUri]);

  return <MonacoEditor ref={editorRef} language="json" {...props} />;
}
