import invariant from 'invariant';
import v1 from './v1';
import v2 from './v2';
import v3 from './v3';
import v4 from './v4';
import v5 from './v5';
import v6 from './v6';
import * as appDom from '..';

const versions = [v1, v2, v3, v4, v5, v6];

invariant(versions.length === appDom.CURRENT_APPDOM_VERSION, 'Unable to find the latest version');

export function isUpToDate(dom: appDom.AppDom) {
  return dom.version === appDom.CURRENT_APPDOM_VERSION;
}

export function migrateUp(
  fromDom: appDom.AppDom,
  toVersion = appDom.CURRENT_APPDOM_VERSION,
): appDom.AppDom {
  const fromVersion = fromDom.version || 0;

  if (toVersion < fromVersion) {
    throw new Error(`Can't migrate dom from version "${fromVersion}" to "${toVersion}"`);
  }

  const migrationsToApply = versions.slice(fromVersion, toVersion);

  let toDom = fromDom;
  for (const migration of migrationsToApply) {
    toDom = migration.up(toDom);
  }

  return toDom;
}
