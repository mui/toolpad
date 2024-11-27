'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled, SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  DataGrid,
  DataGridProps,
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
} from '@mui/x-data-grid';

const ErrorOverlay = styled('div')(({ theme }) => ({
  position: 'absolute',
  backgroundColor: theme.palette.error.light,
  borderRadius: '4px',
  top: 0,
  height: '100%',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  p: 1,
  zIndex: 10,
}));

type CRUDFields = GridColDef[];

type DataModel = Record<string, unknown>;

interface GetManyParams {
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  filterModel: GridFilterModel;
}

export interface ListSlotProps {
  dataGrid?: DataGridProps;
}

export interface ListSlots {
  /**
   * The DataGrid component used to list the items.
   * @default DataGrid
   */
  dataGrid?: React.JSXElementConstructor<DataGridProps>;
}

export interface ListProps<D extends DataModel> {
  /**
   * Fields to show.
   */
  fields: CRUDFields;
  /**
   * Methods to interact with server-side data.
   */
  methods: {
    getMany: (params: GetManyParams) => Promise<{ items: D[]; itemCount: number }>;
  };
  /**
   * Initial number of rows to show per page.
   * @default 100
   */
  initialPageSize?: number;
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots?: ListSlots;
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps?: ListSlotProps;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps;
}

function List<D extends DataModel>(props: ListProps<D>) {
  const { fields, methods, initialPageSize = 100, slots, slotProps, sx } = props;
  const { getMany } = methods;

  const [rowsState, setRowsState] = React.useState<{ rows: D[]; rowCount: number }>({
    rows: [],
    rowCount: 0,
  });

  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: 0,
    pageSize: initialPageSize,
  });
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({ items: [] });
  const [sortModel, setSortModel] = React.useState<GridSortModel>([]);

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetcher = async () => {
      setError(null);
      setIsLoading(true);
      try {
        const data = await getMany({
          paginationModel,
          sortModel,
          filterModel,
        });
        setRowsState({
          rows: data.items,
          rowCount: data.itemCount,
        });
      } catch (dataError) {
        setError(dataError as Error);
      }
      setIsLoading(false);
    };

    fetcher();
  }, [filterModel, getMany, paginationModel, sortModel]);

  const DataGridSlot = slots?.dataGrid ?? DataGrid;

  const initialState = React.useMemo(
    () => ({
      pagination: { paginationModel: { pageSize: initialPageSize } },
    }),
    [initialPageSize],
  );

  return (
    <Box sx={{ flex: 1, position: 'relative' }}>
      <DataGridSlot
        rows={rowsState.rows}
        rowCount={rowsState.rowCount}
        columns={fields}
        pagination
        sortingMode="server"
        filterMode="server"
        paginationMode="server"
        onPaginationModelChange={setPaginationModel}
        onSortModelChange={setSortModel}
        onFilterModelChange={setFilterModel}
        loading={isLoading}
        initialState={initialState}
        sx={{
          ...sx,
        }}
        {...slotProps?.dataGrid}
      />
      {error && (
        <ErrorOverlay>
          <Typography variant="body1">{error.message}</Typography>
        </ErrorOverlay>
      )}
    </Box>
  );
}

List.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Fields to show.
   */
  fields: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        align: PropTypes.oneOf(['center', 'left', 'right']),
        cellClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
        colSpan: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
        description: PropTypes.string,
        disableColumnMenu: PropTypes.bool,
        disableExport: PropTypes.bool,
        disableReorder: PropTypes.bool,
        display: PropTypes.oneOf(['flex', 'text']),
        editable: PropTypes.bool,
        field: PropTypes.string.isRequired,
        filterable: PropTypes.bool,
        filterOperators: PropTypes.arrayOf(
          PropTypes.shape({
            getApplyFilterFn: PropTypes.func.isRequired,
            getValueAsString: PropTypes.func,
            headerLabel: PropTypes.string,
            InputComponent: PropTypes.elementType,
            InputComponentProps: PropTypes.object,
            label: PropTypes.string,
            requiresFilterValue: PropTypes.bool,
            value: PropTypes.string.isRequired,
          }),
        ),
        flex: PropTypes.number,
        getApplyQuickFilterFn: PropTypes.func,
        getSortComparator: PropTypes.func,
        groupable: PropTypes.bool,
        headerAlign: PropTypes.oneOf(['center', 'left', 'right']),
        headerClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
        headerName: PropTypes.string,
        hideable: PropTypes.bool,
        hideSortIcons: PropTypes.bool,
        maxWidth: PropTypes.number,
        minWidth: PropTypes.number,
        pinnable: PropTypes.bool,
        preProcessEditCellProps: PropTypes.func,
        renderCell: PropTypes.func,
        renderEditCell: PropTypes.func,
        renderHeader: PropTypes.func,
        resizable: PropTypes.bool,
        rowSpanValueGetter: PropTypes.func,
        sortable: PropTypes.bool,
        sortComparator: PropTypes.func,
        sortingOrder: PropTypes.arrayOf(PropTypes.oneOf(['asc', 'desc'])),
        type: PropTypes.oneOf([
          'actions',
          'boolean',
          'custom',
          'date',
          'dateTime',
          'number',
          'singleSelect',
          'string',
        ]),
        valueFormatter: PropTypes.func,
        valueGetter: PropTypes.func,
        valueParser: PropTypes.func,
        valueSetter: PropTypes.func,
        width: PropTypes.number,
      }),
      PropTypes.shape({
        align: PropTypes.oneOf(['center', 'left', 'right']),
        cellClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
        colSpan: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
        description: PropTypes.string,
        disableColumnMenu: PropTypes.bool,
        disableExport: PropTypes.bool,
        disableReorder: PropTypes.bool,
        display: PropTypes.oneOf(['flex', 'text']),
        editable: PropTypes.bool,
        field: PropTypes.string.isRequired,
        filterable: PropTypes.bool,
        filterOperators: PropTypes.arrayOf(
          PropTypes.shape({
            getApplyFilterFn: PropTypes.func.isRequired,
            getValueAsString: PropTypes.func,
            headerLabel: PropTypes.string,
            InputComponent: PropTypes.elementType,
            InputComponentProps: PropTypes.object,
            label: PropTypes.string,
            requiresFilterValue: PropTypes.bool,
            value: PropTypes.string.isRequired,
          }),
        ),
        flex: PropTypes.number,
        getActions: PropTypes.func.isRequired,
        getApplyQuickFilterFn: PropTypes.func,
        getSortComparator: PropTypes.func,
        groupable: PropTypes.bool,
        headerAlign: PropTypes.oneOf(['center', 'left', 'right']),
        headerClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
        headerName: PropTypes.string,
        hideable: PropTypes.bool,
        hideSortIcons: PropTypes.bool,
        maxWidth: PropTypes.number,
        minWidth: PropTypes.number,
        pinnable: PropTypes.bool,
        preProcessEditCellProps: PropTypes.func,
        renderCell: PropTypes.func,
        renderEditCell: PropTypes.func,
        renderHeader: PropTypes.func,
        resizable: PropTypes.bool,
        rowSpanValueGetter: PropTypes.func,
        sortable: PropTypes.bool,
        sortComparator: PropTypes.func,
        sortingOrder: PropTypes.arrayOf(PropTypes.oneOf(['asc', 'desc'])),
        type: PropTypes.oneOf([
          /**
           * The type of the column.
           * @default 'actions'
           */
          'actions',
        ]).isRequired,
        valueFormatter: PropTypes.func,
        valueGetter: PropTypes.func,
        valueParser: PropTypes.func,
        valueSetter: PropTypes.func,
        width: PropTypes.number,
      }),
      PropTypes.shape({
        align: PropTypes.oneOf(['center', 'left', 'right']),
        cellClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
        colSpan: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
        description: PropTypes.string,
        disableColumnMenu: PropTypes.bool,
        disableExport: PropTypes.bool,
        disableReorder: PropTypes.bool,
        display: PropTypes.oneOf(['flex', 'text']),
        editable: PropTypes.bool,
        field: PropTypes.string.isRequired,
        filterable: PropTypes.bool,
        filterOperators: PropTypes.arrayOf(
          PropTypes.shape({
            getApplyFilterFn: PropTypes.func.isRequired,
            getValueAsString: PropTypes.func,
            headerLabel: PropTypes.string,
            InputComponent: PropTypes.elementType,
            InputComponentProps: PropTypes.object,
            label: PropTypes.string,
            requiresFilterValue: PropTypes.bool,
            value: PropTypes.string.isRequired,
          }),
        ),
        flex: PropTypes.number,
        getApplyQuickFilterFn: PropTypes.func,
        getOptionLabel: PropTypes.func,
        getOptionValue: PropTypes.func,
        getSortComparator: PropTypes.func,
        groupable: PropTypes.bool,
        headerAlign: PropTypes.oneOf(['center', 'left', 'right']),
        headerClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
        headerName: PropTypes.string,
        hideable: PropTypes.bool,
        hideSortIcons: PropTypes.bool,
        maxWidth: PropTypes.number,
        minWidth: PropTypes.number,
        pinnable: PropTypes.bool,
        preProcessEditCellProps: PropTypes.func,
        renderCell: PropTypes.func,
        renderEditCell: PropTypes.func,
        renderHeader: PropTypes.func,
        resizable: PropTypes.bool,
        rowSpanValueGetter: PropTypes.func,
        sortable: PropTypes.bool,
        sortComparator: PropTypes.func,
        sortingOrder: PropTypes.arrayOf(PropTypes.oneOf(['asc', 'desc'])),
        type: PropTypes.oneOf([
          /**
           * The type of the column.
           * @default 'singleSelect'
           */
          'singleSelect',
        ]).isRequired,
        valueFormatter: PropTypes.func,
        valueGetter: PropTypes.func,
        valueOptions: PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.oneOfType([
              PropTypes.number,
              PropTypes.object,
              PropTypes.shape({
                label: PropTypes.string.isRequired,
                value: PropTypes.any.isRequired,
              }),
              PropTypes.string,
            ]).isRequired,
          ),
          PropTypes.func,
        ]),
        valueParser: PropTypes.func,
        valueSetter: PropTypes.func,
        width: PropTypes.number,
      }),
    ]).isRequired,
  ).isRequired,
  /**
   * Initial number of rows to show per page.
   * @default 100
   */
  initialPageSize: PropTypes.number,
  /**
   * Methods to interact with server-side data.
   */
  methods: PropTypes.shape({
    getMany: PropTypes.func.isRequired,
  }).isRequired,
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: PropTypes.shape({
    dataGrid: PropTypes.object,
  }),
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots: PropTypes.shape({
    dataGrid: PropTypes.elementType,
  }),
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
} as any;

export { List };
