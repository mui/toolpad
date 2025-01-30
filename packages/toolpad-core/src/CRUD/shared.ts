import { GridColDef, GridFilterModel, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';

export type DataModelId = string | number;

export interface DataModel {
  id: DataModelId;
  [key: string]: unknown;
}

export interface GetManyParams {
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  filterModel: GridFilterModel;
}

export interface DataSource<D extends DataModel> {
  fields: GridColDef[];
  getMany?: (params: GetManyParams) => Promise<{ items: D[]; itemCount: number }>;
  getOne?: (id: DataModelId) => Promise<D>;
  createOne?: (data: Omit<D, 'id'>) => Promise<D>;
  updateOne?: (data: Omit<D, 'id'>) => Promise<D>;
  deleteOne?: (id: DataModelId) => Promise<void>;
}
