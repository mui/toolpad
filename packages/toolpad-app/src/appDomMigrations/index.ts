import invariant from 'invariant';
import v1 from './v1';
import { CURRENT_APPDOM_VERSION } from '../appDom';

const versions = new Map([[1, v1]]);

export const latestVersion = Array.from(versions.keys()).pop() as number;

invariant(versions.size === CURRENT_APPDOM_VERSION, 'Unable to find the latest version');

export const latestMigration = versions.get(latestVersion);
