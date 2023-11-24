/**
 * Handles loading env files and watches for updates.
 */
export default class EnvManager {
  // eslint-disable-next-line class-methods-use-this
  getAuthProviders() {
    return Promise.resolve([
      ...(process.env.TOOLPAD_GITHUB_ID && process.env.TOOLPAD_GITHUB_SECRET ? ['github'] : []),
      ...(process.env.TOOLPAD_GOOGLE_CLIENT_ID && process.env.TOOLPAD_GOOGLE_CLIENT_SECRET
        ? ['google']
        : []),
    ]);
  }
}
