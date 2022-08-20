import invariant from 'invariant';
import v2 from './v2';

const versions = new Map([[2, v2]]);

export const latestVersion = Array.from(versions.keys()).pop();

invariant(latestVersion, 'No migrations found');

export const latestMigration = versions.get(latestVersion);
