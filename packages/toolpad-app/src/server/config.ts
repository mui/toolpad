export type ServerConfig = {
  databaseUrl?: string;
  googleSheetsClientId?: string;
  googleSheetsClientSecret?: string;
  encryptionKeys: string[];
};

function readConfig(): ServerConfig {
  if (typeof window !== 'undefined') {
    throw new Error(`Server-side config can't be loaded on the client side`);
  }

  // Whitespace separated, do not use spaces in your keys
  const encryptionKeys: string[] =
    process.env.TOOLPAD_ENCRYPTION_KEYS?.split(/\s+/).filter(Boolean) ?? [];

  return {
    databaseUrl: process.env.TOOLPAD_DATABASE_URL,
    googleSheetsClientId: process.env.TOOLPAD_DATASOURCE_GOOGLESHEETS_CLIENT_ID,
    googleSheetsClientSecret: process.env.TOOLPAD_DATASOURCE_GOOGLESHEETS_CLIENT_SECRET,
    encryptionKeys,
  };
}

export default readConfig();
