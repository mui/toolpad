import v2 from './v2';
import { LATEST_API_VERSION, Page } from '../schema';

const versions = [v2];

function getVersionNumber(version: string) {
  return Number(version.slice(1));
}

export function migratePageUp(fromPage: Page, toVersion = LATEST_API_VERSION): Page {
  const fromVersion = fromPage.apiVersion || 'v1';

  const fromVersionNumber = getVersionNumber(fromVersion);
  const toVersionNumber = getVersionNumber(toVersion);

  if (toVersionNumber < fromVersionNumber) {
    throw new Error(`Can't migrate dom from ${fromVersion} to ${toVersion}`);
  }

  const migrationsToApply = versions.slice(fromVersionNumber - 1, toVersionNumber - 1);

  let toPage = fromPage;
  for (const migration of migrationsToApply) {
    toPage = migration.up(toPage);
  }

  return toPage;
}
