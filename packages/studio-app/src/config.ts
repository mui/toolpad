export interface SharedConfig {
  demoMode: boolean;
}

const clientConfig: SharedConfig = {
  demoMode: process.env.DEMO_MODE === 'true',
};

export default clientConfig;
