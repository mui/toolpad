import { ProviderTemplate } from '../../types';

const providerImport: ProviderTemplate = (provider) => ({
  content: `
  import ${provider} from 'next-auth/providers/${provider?.toLowerCase()}';`,
});

export default providerImport;
