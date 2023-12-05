import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getData } from '../../resources/functions';

type Row = Awaited<ReturnType<typeof getData>>[number];

const COLUMNS: GridColDef<Row>[] = [
  { field: 'id', headerName: 'ID' },
  { field: 'first_name', headerName: 'First name', width: 150 },
  { field: 'last_name', headerName: 'Last name', width: 150 },
  { field: 'email', headerName: 'Email', width: 250 },
  { field: 'gender', headerName: 'Gender' },
  { field: 'ip_address', headerName: 'IP address', width: 150 },
];

export default function MyPage() {
  const { data: rows = [], isLoading } = useQuery({
    queryKey: [getData],
    queryFn: getData,
  });

  return (
    <Box sx={{ width: '100%', height: 400, m: 2 }}>
      <DataGrid
        rows={rows}
        columns={COLUMNS}
        loading={isLoading}
        initialState={{
          columns: {
            columnVisibilityModel: {
              id: false,
            },
          },
        }}
      />
    </Box>
  );
}
