import config from '../config';

export const MOVIES_API_DEMO_URL = new URL(
  '/static/movies.json',
  config.externalUrl || window.location.href,
).href;
