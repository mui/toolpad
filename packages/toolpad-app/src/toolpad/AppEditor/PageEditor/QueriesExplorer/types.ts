import { QueryNode } from '../../../../appDom';

export type QueryMeta = {
  name: string;
  dataSource?: string;
};

export type PanelState =
  | {
      node?: undefined;
      isDraft?: undefined;
    }
  | {
      node: QueryNode;
      isDraft: boolean;
    };
