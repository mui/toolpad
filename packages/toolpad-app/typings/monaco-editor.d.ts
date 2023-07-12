declare module 'monaco-editor/esm/vs/basic-languages/javascript/javascript' {
  import type * as monaco from 'monaco-editor';

  export const conf: monaco.languages.LanguageConfiguration;
  export const language: monaco.languages.IMonarchLanguage;
}

declare module 'monaco-editor/esm/vs/basic-languages/typescript/typescript' {
  import type * as monaco from 'monaco-editor';

  export const conf: monaco.languages.LanguageConfiguration;
  export const language: monaco.languages.IMonarchLanguage;
}

declare module 'monaco-editor/esm/vs/basic-languages/markdown/markdown' {
  import type * as monaco from 'monaco-editor';

  export const conf: monaco.languages.LanguageConfiguration;
  export const language: monaco.languages.IMonarchLanguage;
}

declare module 'monaco-editor/esm/vs/language/css/css.worker';
declare module 'monaco-editor/esm/vs/language/html/html.worker';
declare module 'monaco-editor/esm/vs/language/json/json.worker';
declare module 'monaco-editor/esm/vs/language/typescript/ts.worker';
declare module 'monaco-editor/esm/vs/editor/editor.worker';
