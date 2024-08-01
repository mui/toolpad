export default (provider: string) => `
import ${provider} from 'next-auth/providers/${provider?.toLowerCase()}';`;
