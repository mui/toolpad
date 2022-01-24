export interface StudioConfiguration {
  dir: string;
}

const serializedConfig = process.env.STUDIO_UI_CONFIG;
if (!serializedConfig) {
  throw new Error(`App started without config env variable STUDIO_UI_CONFIG`);
}

export default JSON.parse(serializedConfig) as StudioConfiguration;
