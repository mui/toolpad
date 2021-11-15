const studioConfig = process.env.STUDIO_UI_CONFIG ? JSON.parse(process.env.STUDIO_UI_CONFIG) : {};

// We can pass this to serverRuntimeConfig and publicRuntimeConfig as desired
// QUESTION: Do we really want to depend on runtime config? What are the alternatives?
// Running a backend server and fetching configuration ourselves on app startup?
// Do we want to keep the app statically servable?
console.log(`Config: ${JSON.stringify(studioConfig, null, 2)}`);

/** @type {import("next").NextConfig} */
const config = {};

export default config;
