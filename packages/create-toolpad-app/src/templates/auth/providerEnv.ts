import { ProviderTemplate } from '../../types';

const providerEnv: ProviderTemplate = (provider) => ({
  content: `
${provider?.toUpperCase()}_CLIENT_ID=
${provider?.toUpperCase()}_CLIENT_SECRET=
`,
});

export default providerEnv;
