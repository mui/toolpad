// TODO move to docs-infra as a shared helper
/**
 * This function allows to turn link from the docs to GitHub to be closer to permalink.
 * Meaning, its purpose is so that we can version the docs while having it continue to work, or
 * be able to introduce breaking changes on a next active branch without breaking the docs experience
 * for stable version docs users.
 */
export function versionGitHubLink(href: string) {
  // Bailed out, not a link that needs to be handled.
  if (!href.startsWith(`${process.env.SOURCE_CODE_REPO}/tree/master`)) {
    return href;
  }

  return href.replace(
    `${process.env.SOURCE_CODE_REPO}/tree/master`,
    `${process.env.SOURCE_CODE_REPO}/tree/v${process.env.LIB_VERSION}`,
  );
}

export interface Example {
  title: string;
  description: string;
  src: string;
  srcDark: string;
  href?: string;
  source: string;
  codeSandbox?: boolean;
  stackBlitz?: boolean;
  new?: boolean;
  featured?: boolean;
}
