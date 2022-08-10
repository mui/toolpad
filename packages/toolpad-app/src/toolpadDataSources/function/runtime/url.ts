// whatwg-url depends on TextEndoder/TextDecoder
import './textEncoding';
import { URL, URLSearchParams } from 'whatwg-url';
import invariant from 'invariant';

invariant('TextEncoder' in global, 'TextEncoder is required');
invariant('TextDecoder' in global, 'TextDecoder is required');

// @ts-expect-error Can't turn off @types/node which gets pulled in automatically
// https://github.com/microsoft/TypeScript/issues/37053
global.URL = URL;

// @ts-expect-error Can't turn off @types/node which gets pulled in automatically
// https://github.com/microsoft/TypeScript/issues/37053
global.URLSearchParams = URLSearchParams;

export {};
