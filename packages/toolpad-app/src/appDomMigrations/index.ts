import invariant from 'invariant';
import v1 from './v1';

const versions = new Map([[1, v1]]);

export const latestVersion = Array.from(versions.keys()).pop();

invariant(latestVersion, 'No migrations found');

export const latestMigration = versions.get(latestVersion);
