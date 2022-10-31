import rest from './rest/runtime';
import { RuntimeDataSource } from '../types';

type RuntimeDataSources = { [key: string]: RuntimeDataSource<any, any> | undefined };

const runtimeDataSources: RuntimeDataSources = {
  rest,
};

export default runtimeDataSources;
