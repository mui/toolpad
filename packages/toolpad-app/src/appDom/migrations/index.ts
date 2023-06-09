import invariant from 'invariant';
import v1 from './v1';
import v2 from './v2';
import v3 from './v3';
import v4 from './v4';
import v5 from './v5';
import v6 from './v6';
import v7 from './v7';
import * as appDom from '..';
import * as v7LegacyAppDom from './types/v7Down';

const versions = [v1, v2, v3, v4, v5, v6, v7];

invariant(versions.length === appDom.CURRENT_APPDOM_VERSION, 'Unable to find the latest version');

export function isUpToDate(dom: appDom.AppDom) {
  return dom.version === appDom.CURRENT_APPDOM_VERSION;
}

export function migrateUp(
  fromDom: v7LegacyAppDom.AppDom,
  toVersion = appDom.CURRENT_APPDOM_VERSION,
): appDom.AppDom | v7LegacyAppDom.AppDom {
  const fromVersion = fromDom.version || 0;

  if (toVersion < fromVersion) {
    throw new Error(`Can't migrate dom from version "${fromVersion}" to "${toVersion}"`);
  }

  const migrationsToApply = versions.slice(fromVersion, toVersion);

  let toDom: appDom.AppDom | v7LegacyAppDom.AppDom = fromDom;
  for (const migration of migrationsToApply) {
    toDom = migration.up(toDom as v7LegacyAppDom.AppDom);
  }

  return toDom;
}
