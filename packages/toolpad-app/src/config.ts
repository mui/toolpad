import { RUNTIME_CONFIG_WINDOW_PROPERTY } from './constants';

type ToolpadTargetType = 'CLOUD' | 'CE' | 'PRO';

// These are inlined at build time
export interface BuildEnvVars {
  TOOLPAD_TARGET: ToolpadTargetType;
}

// These are set at runtime and passed to the browser.
// Do not add secrets
export interface RuntimeConfig {
  // This is a test
  foo?: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends BuildEnvVars {}
  }
}

declare global {
  interface Window {
    [RUNTIME_CONFIG_WINDOW_PROPERTY]?: RuntimeConfig;
  }
}

function getBrowsersideRuntimeConfig(): RuntimeConfig {
  // These are being initialized in ./pages/_document.tsx
  const maybeRuntimeConfig = window[RUNTIME_CONFIG_WINDOW_PROPERTY];
  if (!maybeRuntimeConfig) {
    throw new Error(`Unable to access the runtime config in the browser`);
  }
  return maybeRuntimeConfig;
}

export const runtimeConfig: RuntimeConfig =
  typeof window === 'undefined'
    ? {
        foo: process.env.TOOLPAD_FOO,
      }
    : getBrowsersideRuntimeConfig();

export default runtimeConfig as RuntimeConfig;
