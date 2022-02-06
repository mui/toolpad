import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

export interface SharedConfig {
  demoMode: boolean;
}

export default publicRuntimeConfig as SharedConfig;
