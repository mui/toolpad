'use client';
import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import CustomDataGrid from '../../components/CustomDataGrid';
import { rows, columns } from '../../mocks/gridOrdersData';

export default function OrdersPage() {
  return (
    <PageContainer>
      <CustomDataGrid rows={rows} columns={columns} />
    </PageContainer>
  );
}
