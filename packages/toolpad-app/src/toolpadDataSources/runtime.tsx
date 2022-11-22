import rest from './rest/runtime';
import functionSrc from './function/runtime';
import { RuntimeDataSource } from '../types';

type RuntimeDataSources = { [key: string]: RuntimeDataSource<any, any> | undefined };

const runtimeDataSources: RuntimeDataSources = {
  rest,
  function: functionSrc,
};

export default runtimeDataSources;
