import { EntitySchema } from 'typeorm';
import { StudioPageContent } from '../../types';

export interface Page {
  id: string;
  pathname: string;
  title: string;
  content: StudioPageContent;
}

export const PageEntity = new EntitySchema<Page>({
  name: 'page',
  columns: {
    id: {
      type: String,
      primary: true,
      nullable: false,
    },
    pathname: {
      type: String,
      nullable: false,
      unique: true,
    },
    title: {
      type: String,
      nullable: false,
    },
    content: {
      type: 'simple-json',
      nullable: false,
    },
  },
});
