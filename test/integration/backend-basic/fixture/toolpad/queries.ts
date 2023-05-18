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
