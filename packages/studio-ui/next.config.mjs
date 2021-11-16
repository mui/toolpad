/** @type {import("@mui/studio-core").StudioConfiguration} */
const studioConfig = process.env.STUDIO_UI_CONFIG ? JSON.parse(process.env.STUDIO_UI_CONFIG) : {};

// We can pass this to serverRuntimeConfig and publicRuntimeConfig as desired
// QUESTION: Do we really want to depend on runtime config? What are the alternatives?
// Avoid serverRuntimeConfig and just read the env variable in API routes?
console.log(`Config: ${JSON.stringify(studioConfig, null, 2)}`);

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
};

export default config;
