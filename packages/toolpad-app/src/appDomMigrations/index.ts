<<<<<<< HEAD
import invariant from 'invariant';
import v2 from './v2';

const versions = new Map([[2, v2]]);

export const latestVersion = Array.from(versions.keys()).pop();

invariant(latestVersion, 'No migrations found');

export const latestMigration = versions.get(latestVersion);
=======
import v1 from './v1';
import v2 from './v2';

const versions = new Map([
  ['1', v1],
  ['2', v2],
]);

export const latestVersion = Array.from(versions.keys()).pop();
>>>>>>> 9e7ca81dffa0d3e6909aed6fc562c04b09717477
