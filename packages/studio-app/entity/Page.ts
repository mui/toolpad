import { EntitySchema } from 'typeorm';

export interface Page {
  id: number;
  name: string;
  content: string;
}

export const PageEntity = new EntitySchema<Page>({
  name: 'page',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    name: {
      type: String,
    },
    content: {
      type: String,
    },
  },
});
