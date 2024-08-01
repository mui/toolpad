export default (provider: string) => `
${provider.toUpperCase()}_CLIENT_ID=
${provider.toUpperCase()}_CLIENT_SECRET=
`;
