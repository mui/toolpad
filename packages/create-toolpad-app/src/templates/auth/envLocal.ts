import { kebabToConstant } from '@toolpad/utils/strings';
import { Template } from '../../types';

const env: Template = (options) => {
  const { authProviders: providers } = options;
  const oAuthProviders = providers?.filter((provider) => provider !== 'credentials');
  return `
# Generate a secret with \`npx auth secret\`
# and replace the value below with it
AUTH_SECRET=secret

# Add the CLIENT_ID and CLIENT_SECRET from your OAuth provider
# to the .env.local file
${oAuthProviders
  ?.map(
    (provider) => `
${kebabToConstant(provider)}_CLIENT_ID=
${kebabToConstant(provider)}_CLIENT_SECRET=`,
  )
  .join('\n')}    
`;
};

export default env;
