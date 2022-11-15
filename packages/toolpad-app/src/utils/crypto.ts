import invariant from 'invariant';

const crypto =
  typeof window === 'undefined'
    ? // eslint-disable-next-line global-require
      (invariant(!global.crypto, 'Remove the crypto polyfill'), require('crypto'))
    : global.crypto;

export default crypto;
