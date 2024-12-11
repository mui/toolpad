import { GridColDef } from '@mui/x-data-grid';

export type CRUDFields = GridColDef[];

export type DataModelId = string | number;

export interface DataModel {
  id: DataModelId;
  [key: string]: unknown;
}
