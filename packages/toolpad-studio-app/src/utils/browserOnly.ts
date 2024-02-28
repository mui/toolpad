// Warning message for modules that can only work in the browser.
// Load it as the first import statement with
//   import './utils/browserOnly';

if (process.env.NODE_ENV !== 'production' && typeof window === 'undefined') {
  throw new Error(`Browser-only module loaded outside of the browser`);
}

export {};
