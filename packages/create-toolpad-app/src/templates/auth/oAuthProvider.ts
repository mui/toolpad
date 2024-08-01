export default (provider: string) => `
  ${provider}({
    clientId: process.env.${provider.toUpperCase()}_CLIENT_ID,
    clientSecret: process.env.${provider.toUpperCase()}_CLIENT_SECRET,
  }),`;
