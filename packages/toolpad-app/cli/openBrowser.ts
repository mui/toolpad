// From https://github.com/facebook/create-react-app/blob/main/packages/react-dev-utils/openBrowser.js
import open from 'open';

const Actions = Object.freeze({
  NONE: 0,
  BROWSER: 1,
});

function getBrowserEnv() {
  // Attempt to honor this environment variable.
  // It is specific to the operating system.
  // See https://github.com/sindresorhus/open#app for documentation.
  const value = process.env.TOOLPAD_CLI_BROWSER;

  const args = process.env.TOOLPAD_CLI_BROWSER_ARGS
    ? process.env.TOOLPAD_CLI_BROWSER_ARGS.split(' ')
    : [];

  let action;
  if (!value) {
    // Default.
    action = Actions.BROWSER;
  } else if (value.toLowerCase() === 'none') {
    action = Actions.NONE;
  } else {
    action = Actions.BROWSER;
  }
  return { action, value, args };
}

async function startBrowserProcess(url: string, browserName?: string, args?: string[]) {
  // (Use open to open a new tab)
  try {
    // Omit the `app` property if the TOOLPAD_CLI_BROWSER variable is not specified
    // to let `open` use the default browser.
    // This means that TOOLPAD_CLI_BROWSER_ARGS will be ignored if TOOLPAD_CLI_BROWSER is not set.
    const options: open.Options = { wait: false };
    open(url, browserName ? { ...options, app: { name: browserName, arguments: args } } : options);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Reads the TOOLPAD_CLI_BROWSER environment variable and decides what to do with it. Returns
 * true if it opened a browser, otherwise false.
 */
const openBrowser = async (url: string) => {
  const { default: chalk } = await import('chalk');
  const { action, value, args } = getBrowserEnv();
  switch (action) {
    case Actions.NONE:
      // Special case: BROWSER="none" will prevent opening completely.
      return false;

    case Actions.BROWSER:
      // eslint-disable-next-line no-console
      console.log(`${chalk.green('success')} - Toolpad connected! Opening browser...`);
      return startBrowserProcess(url, value, args);

    default:
      throw new Error('Not implemented.');
  }
};

export default openBrowser;
