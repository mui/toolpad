import movies from './movies/client';
import postgres from './postgres/client';
import functionSrc from './function/client';
import rest from './rest/client';
import { ClientDataSource } from '../types';
import googleSheets from './googleSheets/client';

const clientDataSources: { [key: string]: ClientDataSource<any, any> | undefined } = {
  movies,
  postgres,
  function: functionSrc,
  rest,
  googleSheets,
};

export default clientDataSources;
