import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { match as pathToRegexpMatch } from 'path-to-regexp';
import EditorCanvas from '../src/components/EditorCanvas';
import { APP_ROOT_ID } from '../src/constants';

const EDITOR_BASENAME = '/editor-canvas';
const { pathname } = new URL(window.location.href);
const match = pathToRegexpMatch<{ appId: string | undefined }>('/editor-canvas/:appId/:path*', {
  decode: decodeURIComponent,
});
const result = match(pathname);

if (!result || !result.params.appId) {
  throw new Error(`Can't find appId in url`);
}
const editorPathname = pathname.slice(EDITOR_BASENAME.length + 1);
const appId = editorPathname.slice(0, editorPathname.indexOf('/'));

const container = document.getElementById(APP_ROOT_ID);
if (!container) {
  throw new Error(`Can't locate app container #${APP_ROOT_ID}`);
}
const root = createRoot(container);

root.render(<EditorCanvas basename={`${EDITOR_BASENAME}/${appId}`} appId={appId} />);
