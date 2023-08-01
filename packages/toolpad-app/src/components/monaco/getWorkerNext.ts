import type * as monaco from 'monaco-editor';

const getWorker: monaco.Environment['getWorker'] = async (_, label) => {
  if (label === 'typescript') {
    return new Worker(
      new URL(`monaco-editor/esm/vs/language/typescript/ts.worker`, import.meta.url),
    );
  }
  if (label === 'json') {
    return new Worker(new URL(`monaco-editor/esm/vs/language/json/json.worker`, import.meta.url));
  }
  if (label === 'html') {
    return new Worker(new URL(`monaco-editor/esm/vs/language/html/html.worker`, import.meta.url));
  }
  if (label === 'css') {
    return new Worker(new URL(`monaco-editor/esm/vs/language/css/css.worker`, import.meta.url));
  }
  if (label === 'editorWorkerService') {
    return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url));
  }
  throw new Error(`Failed to resolve worker with label "${label}"`);
};

export default getWorker;
