import { createFunction, getContext } from '@toolpad/studio/server';
import rawText from './raw.txt';
import rawSql from './raw.sql';

export async function hello() {
  return { message: 'hello world' };
}

export async function throws() {
  throw new Error('BOOM!');
}

export const throwsMsg = createFunction(
  async function throwsMsg({ parameters }) {
    throw new Error(parameters.msg);
  },
  {
    parameters: {
      msg: {
        type: 'string',
      },
    },
  },
);

export const echo = createFunction(
  async function echo({ parameters }) {
    return {
      params: parameters,
      secrets: {
        bar: process.env.SECRET_BAR,
        baz: process.env.SECRET_BAZ,
      },
    };
  },
  {
    parameters: {
      foo: {
        type: 'string',
      },
    },
  },
);

export async function edited() {
  return 'edited hello';
}

export const withParams = createFunction(
  async ({ parameters }) => {
    return { parameters };
  },
  {
    parameters: {
      foo: { type: 'string' },
      // __NEW_PARAMETER__
    },
  },
);

export const manualQueryWithParams = createFunction(
  async ({ parameters }) => {
    return { parameters };
  },
  {
    parameters: {
      foo: { type: 'string' },
    },
  },
);

let x = 1;

export async function increment() {
  x += 1;
}

export async function getGlobal() {
  return x;
}

interface Circular {
  a?: Circular;
  msg: string;
}

export async function circularData() {
  const a: Circular = { msg: 'hello' };
  a.a = a;
  return a;
}

export async function nonCircularData() {
  const a = { b: 'hello' };
  return { a1: a, a2: a };
}

export async function functionData() {
  return { a() {} };
}

export async function invalidError() {
  // Yes, I'm throwing a function here
  // eslint-disable-next-line no-throw-literal
  throw function Hello() {};
}

export function syncFunction() {
  return { message: "hello I'm synchronous" };
}

export async function bareWithParams(
  foo: string,
  bar: number,
  quux: boolean,
  fizz: 'hello' | 'world',
  baz = { hello: 1 },
  /** BARE_DUMMY_PARAM */
) {
  return {
    message: `foo: ${foo}; typeof bar: ${typeof bar}; quux: ${quux}; baz.hello: ${baz.hello}`,
  };
}

export function neverResolving() {
  return new Promise(() => {});
}

export async function getRawText() {
  return [rawText, rawSql].join(' | ');
}

export async function inspectContext() {
  return getContext();
}

export async function setCustomCookie() {
  const context = getContext();
  context.setCookie('MY_TOOLPAD_COOKIE', 'hello everybody!!!');
}

export async function someNonJson() {
  return {
    date: new Date(1701095735511),
    regexp: /foo/i,
  };
}

export interface RowDataPacket {
  constructor: {
    name: 'RowDataPacket';
  };
  [column: string]: any;
  [column: number]: any;
}

export async function mysqlResult(): Promise<RowDataPacket[]> {
  return [];
}
