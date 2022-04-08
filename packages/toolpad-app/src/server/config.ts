import sharedConfig, { SharedConfig } from '../config';

export interface ServerConfig extends SharedConfig {
  googleSheetsClientId?: string;
  googleSheetsClientSecret?: string;
  externalUrl?: string;
  encryptionKeys: string[];
}

function readConfig(): ServerConfig {
  // TODO: Find/evaluate libraries:
  //  - https://www.npmjs.com/package/convict
  //  - https://www.npmjs.com/package/env-schema
  //  - https://www.npmjs.com/package/config
  //  - https://www.npmjs.com/package/ajv
  //  - ...?
  // Features:
  //  - read from env
  //  - optional: read from args
  //  - optional: read from file
  //  - strongly typed output
  //  - validate all at once, print summary of errors
  //  - print help text (e.g. on --help)
  //  - config object to generate docs from
  //  - optional: custom formats/validators
  //  - ...?

  if (!process.env.TOOLPAD_DATABASE_URL) {
    console.warn(`App started without config env variable TOOLPAD_DATABASE_URL`);
  }

  const encryptionKeys: string[] =
    process.env.TOOLPAD_ENCRYPTION_KEYS?.split(/\s+/).filter(Boolean) ?? [];

  return {
    ...sharedConfig,
    googleSheetsClientId: process.env.TOOLPAD_DATASOURCE_GOOGLESHEETS_CLIENT_ID,
    googleSheetsClientSecret: process.env.TOOLPAD_DATASOURCE_GOOGLESHEETS_CLIENT_SECRET,
    externalUrl: process.env.TOOLPAD_EXTERNAL_URL,
    // Whitespace separated, do not use spaces in your keys
    encryptionKeys,
  };
}

export default readConfig();
