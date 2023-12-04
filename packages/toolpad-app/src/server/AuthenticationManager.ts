export default class AuthManager {
  // eslint-disable-next-line class-methods-use-this
  getAuthProvider() {
    return new Promise((resolve) => {
      if (process.env.TOOLPAD_GITHUB_ID && process.env.TOOLPAD_GITHUB_SECRET) {
        resolve('github');
      }
      if (process.env.TOOLPAD_GOOGLE_CLIENT_ID && process.env.TOOLPAD_GOOGLE_CLIENT_SECRET) {
        resolve('google');
      }

      resolve(null);
    });
  }
}
