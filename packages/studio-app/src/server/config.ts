import sharedConfig, { SharedConfig } from '../config';

export interface ServerConfig extends SharedConfig {
  databaseUrl: string;
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

  if (!process.env.STUDIO_DATABASE_URL) {
    throw new Error(`App started without config env variable STUDIO_DATABASE_URL`);
  }

  return {
    ...sharedConfig,
    databaseUrl: process.env.STUDIO_DATABASE_URL,
    // Whitespace separated, do not use spaces in your keys
    encryptionKeys: process.env.STUDIO_ENCRYPTION_KEYS?.split(/\s+/).filter(Boolean) ?? [],
  };
}

export default readConfig();
