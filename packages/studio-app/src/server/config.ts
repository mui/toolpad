import sharedConfig, { SharedConfig } from '../config';

export interface ServerConfig extends SharedConfig {
  databaseUrl: string;
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
  };
}

export default readConfig();
