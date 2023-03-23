import { createQuery } from '@mui/toolpad-core';

export async function hello() {
  return { message: 'hello world' };
}

export async function throws() {
  throw new Error('BOOM!');
}

export const echo = createQuery(
  async function echo({ parameters }) {
    return {
      params: parameters,
      secrets: {
        bar: process.env.SECRET_BAR,
      },
    };
  },
  {
    parameters: {
      foo: {
        typeDef: { type: 'string' },
      },
    },
  },
);

export async function edited() {
  return 'edited hello';
}
