import { ProviderTemplate } from '../../types';

const oaAuthProvider: ProviderTemplate = (provider) => ({
  content: `
  ${provider}({
    clientId: process.env.${provider?.toUpperCase()}_CLIENT_ID,
    clientSecret: process.env.${provider?.toUpperCase()}_CLIENT_SECRET,
  }),`,
});

export default oaAuthProvider;
