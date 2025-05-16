import * as React from 'react';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';

export default function CustomDataGrid(props: DataGridProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <DataGrid
        {...props}
        getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd')}
        initialState={{
          pagination: { paginationModel: { pageSize: 20 } },
        }}
        sx={{
          ...props.sx,
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[200],
          '& .MuiDataGrid-cell': {
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[200],
          },
        }}
        pageSizeOptions={[10, 20, 50]}
        disableColumnResize
        slotProps={{
          filterPanel: {
            sx: {
              '& .MuiDataGrid-filterForm': {
                columnGap: 1.5,
                marginTop: 2,
              },
            },
            filterFormProps: {
              logicOperatorInputProps: {
                variant: 'outlined',
                size: 'small',
              },
              columnInputProps: {
                variant: 'outlined',
                size: 'small',
                sx: { mt: 'auto' },
              },
              operatorInputProps: {
                variant: 'outlined',
                size: 'small',
                sx: { mt: 'auto' },
              },
              valueInputProps: {
                InputComponentProps: {
                  variant: 'outlined',
                  size: 'small',
                },
              },
            },
          },
        }}
      />
    </div>
  );
}
