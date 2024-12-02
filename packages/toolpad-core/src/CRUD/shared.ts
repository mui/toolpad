import { GridColDef, GridRowId } from '@mui/x-data-grid';

export type CRUDFields = GridColDef[];

export type DataModelId = GridRowId;

export interface DataModel {
  id: DataModelId;
  [key: string]: unknown;
}
