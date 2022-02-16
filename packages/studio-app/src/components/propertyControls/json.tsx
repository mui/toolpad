import type * as monacoEditor from 'monaco-editor';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import * as React from 'react';
import Editor from '@monaco-editor/react';
import schemas from '../../schemas';
import type { EditorProps, PropControlDefinition } from '../../types';

function JsonPropEditor({ propName, argType, value, onChange, disabled }: EditorProps<any>) {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const valueAsString = React.useMemo(() => JSON.stringify(value, null, 2), [value]);
  const [input, setInput] = React.useState(valueAsString);
  React.useEffect(() => setInput(valueAsString), [valueAsString]);

  const handleSave = React.useCallback(() => {
    try {
      const newValue = JSON.parse(input);
      onChange(newValue);
    } catch (err: any) {
      alert(err.message);
    }
  }, [onChange, input]);

  const schemaUri =
    argType.typeDef.type === 'object' || argType.typeDef.type === 'array'
      ? argType.typeDef.schema
      : null;

  const fileUri = `file:///x.json`;

  const HandleEditorMount = React.useCallback(
    (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
      editor.updateOptions({
        minimap: { enabled: false },
        accessibilitySupport: 'off',
      });

      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: Object.entries(schemas).map(([uri, schema]) => {
          return {
            uri,
            fileMatch: uri === schemaUri ? [fileUri] : [], // associate with our file
            schema,
          };
        }),
      });

      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.Latest,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: 'React',
        allowJs: true,
        typeRoots: ['node_modules/@types'],
      });

      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });
    },
    [schemaUri, fileUri],
  );

  return (
    <React.Fragment>
      <Button onClick={() => setDialogOpen(true)}>{propName}</Button>
      <Dialog fullWidth open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Edit JSON</DialogTitle>
        <DialogContent>
          <Editor
            height="200px"
            value={input}
            onChange={(newValue = '') => setInput(newValue)}
            path={fileUri}
            language="json"
            options={{ readOnly: disabled }}
            onMount={HandleEditorMount}
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={valueAsString === input} onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

const jsonType: PropControlDefinition<string> = {
  Editor: JsonPropEditor,
};

export default jsonType;
