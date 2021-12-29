import { EntitySchema } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { Api } from './Api';

export interface Connection {
  id: string;
  name: string;
  type: string;
  params: string;
  queries: Api[];
}

export const ConnectionEntity = new EntitySchema<Connection>({
  name: 'connection',
  columns: {
    id: {
      type: String,
      primary: true,
      nullable: false,
    },
    name: {
      type: String,
      nullable: false,
    },
    type: {
      type: String,
      nullable: false,
    },
    params: {
      type: String,
      nullable: false,
    },
  },
  relations: {
    queries: {
      type: 'one-to-many',
      target: 'api',
      inverseSide: 'api.connection',
    },
  },
});
