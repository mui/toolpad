import * as React from 'react';
import * as monaco from 'monaco-editor';

(globalThis as any).MonacoEnvironment = {
  getWorkerUrl(_, label) {
    if (label === 'json') {
      return '/_next/static/json.worker.js';
    }
    if (label === 'css') {
      return '/_next/static/css.worker.js';
    }
    if (label === 'html') {
      return '/_next/static/html.worker.js';
    }
    if (label === 'typescript' || label === 'javascript') {
      return '/_next/static/ts.worker.js';
    }
    return '/_next/static/editor.worker.js';
  },
} as monaco.Environment;

export interface MonacoEditorProps {}

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

export default function MonacoEditor({}: MonacoEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!editorRef.current) {
      return () => {};
    }

    const editor = monaco.editor.create(editorRef.current, {
      value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
      language: 'typescript',
      minimap: { enabled: false },
      accessibilitySupport: 'off',
      tabSize: 2,
    });

    return () => editor.dispose();
  }, []);

  return <div style={{ height: '100%' }} ref={editorRef} />;
}
