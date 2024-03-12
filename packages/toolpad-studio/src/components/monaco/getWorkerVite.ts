/// <reference types="vite/client" />

import type * as monaco from 'monaco-editor';

import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

const getWorker: monaco.Environment['getWorker'] = async (_, label) => {
  // { type: 'module' } is supported in firefox but behind feature flag:
  // you have to enable it manually via about:config and set dom.workers.modules.enabled to true.
  if (label === 'typescript') {
    return new TsWorker();
  }
  if (label === 'json') {
    return new JsonWorker();
  }
  if (label === 'html') {
    return new HtmlWorker();
  }
  if (label === 'css') {
    return new CssWorker();
  }
  if (label === 'editorWorkerService') {
    return new EditorWorker();
  }
  throw new Error(`Failed to resolve worker with label "${label}"`);
};

export default getWorker;
