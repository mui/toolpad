import { createFunction } from '@mui/toolpad/server';

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
}

export async function circularData() {
  const a: Circular = {};
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
  throw function Hello() {};
}

export function neverResolving() {
  return new Promise(() => {});
}
