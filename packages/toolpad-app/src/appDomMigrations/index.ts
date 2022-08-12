import v1 from './v1';
import v2 from './v2';

const versions = new Map([
  ['1', v1],
  ['2', v2],
]);

export const latestVersion = Array.from(versions.keys()).pop();
