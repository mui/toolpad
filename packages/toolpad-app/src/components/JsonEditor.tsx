/**
 * NOTE: This file can't SSR (use reactLazyNoSsr to load it)
 */

import * as React from 'react';
import MonacoEditor, { MonacoEditorHandle } from './MonacoEditor';

export interface JsonEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  schemaUri?: string;
  disabled?: boolean;
}

export default function JsonEditor({ value, onChange, schemaUri, disabled }: JsonEditorProps) {
  const editorRef = React.useRef<MonacoEditorHandle>(null);

  React.useEffect(() => {
    console.log(schemaUri);
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

  const editorOptions = React.useMemo(
    () => ({
      readOnly: disabled,
    }),
    [disabled],
  );

  return (
    <MonacoEditor
      ref={editorRef}
      value={value}
      onChange={onChange}
      language="json"
      options={editorOptions}
    />
  );
}
