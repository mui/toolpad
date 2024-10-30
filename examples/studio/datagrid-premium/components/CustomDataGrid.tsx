import * as React from 'react';
import { createComponent } from '@toolpad/studio/browser';
import { DataGridPremium, GridColDef } from '@mui/x-data-grid-premium';
import { LicenseInfo } from '@mui/x-license';

LicenseInfo.setLicenseKey('LICENSE_KEY');

export interface CustomDataGridProps {
  rows: any[];
}

const columns: GridColDef[] = [
  {
    field: 'name',
    groupable: true,
  },
  { field: 'age' },
];

function CustomDataGrid({ rows }: CustomDataGridProps) {
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGridPremium rows={rows} columns={columns} hideFooter />
    </div>
  );
}

export default createComponent(CustomDataGrid, {
  argTypes: {
    rows: { type: 'array', defaultValue: [] },
  },
});
