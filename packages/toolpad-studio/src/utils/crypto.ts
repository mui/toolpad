import invariant from 'invariant';

const crypto =
  typeof window === 'undefined'
    ? // eslint-disable-next-line global-require
      (invariant(!!global.crypto, 'Remove the crypto polyfill'), require('crypto'))
    : global.crypto;

/**
 * Isomorphic version of web `crypto`.
 * In anticipation of `globalThis.crypto` becoming stable in Node.js.
 * See https://nodejs.org/api/globals.html#crypto_1
 */
export default crypto;
