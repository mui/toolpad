import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

export interface SharedConfig {}

export default publicRuntimeConfig as SharedConfig;
