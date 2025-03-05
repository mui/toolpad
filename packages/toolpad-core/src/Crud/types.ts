import {
  GridColDef,
  GridColType,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
} from '@mui/x-data-grid';

export type DataModelId = string | number;

export interface DataModel {
  id: DataModelId;
  [key: string]: unknown;
}

type RemappedOmit<T, K extends PropertyKey> = { [P in keyof T as P extends K ? never : P]: T[P] };

export type OmitId<D extends DataModel> = RemappedOmit<D, 'id'>;

export type DataField = RemappedOmit<GridColDef, 'type'> & { type?: GridColType };

export interface DataSource<D extends DataModel> {
  fields: DataField[];
  getMany?: (params: {
    paginationModel: GridPaginationModel;
    sortModel: GridSortModel;
    filterModel: GridFilterModel;
  }) => Promise<{ items: D[]; itemCount: number }>;
  getOne?: (id: DataModelId) => Promise<D>;
  createOne?: (data: Partial<OmitId<D>>) => Promise<D>;
  updateOne?: (id: DataModelId, data: Partial<OmitId<D>>) => Promise<D>;
  deleteOne?: (id: DataModelId) => Promise<void>;
  /**
   * Function to validate form values. Returns object with error strings for each field.
   */
  validate?: (
    formValues: Partial<OmitId<D>>,
  ) => Partial<Record<keyof D, string>> | Promise<Partial<Record<keyof D, string>>>;
}
