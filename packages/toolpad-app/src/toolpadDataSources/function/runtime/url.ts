import { URL, URLSearchParams } from 'whatwg-url';

// @ts-expect-error Can't turn of @types/node which gets pulled in automatically
// https://github.com/microsoft/TypeScript/issues/37053
global.URL = URL;

// @ts-expect-error Can't turn of @types/node which gets pulled in automatically
// https://github.com/microsoft/TypeScript/issues/37053
global.URLSearchParams = URLSearchParams;

export {};
