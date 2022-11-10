import { RestConnectionParams } from './types';

export const FETCH_CONNECTION_TEMPLATES: Map<string, RestConnectionParams> = new Map([
  ['COVID API', { baseUrl: 'https://covid-19.dataflowkit.com/' }],
  ['Dogs API', { baseUrl: 'https://dog.ceo/api/' }],
]);
