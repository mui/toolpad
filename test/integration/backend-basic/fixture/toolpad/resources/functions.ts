import { createFunction } from '@mui/toolpad/server';

export async function hello() {
  return { message: 'hello world' };
}

export async function throws() {
  throw new Error('BOOM!');
}

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
