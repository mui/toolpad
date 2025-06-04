'use client';
import * as React from 'react';
import { Crud } from '@toolpad/core/Crud';
import { employeesDataSource, Employee, employeesCache } from '../../../mocks/employees';
import CustomDataGrid from '../../../components/CustomDataGrid';

export default function EmployeesCrudPage() {
  return (
    <Crud<Employee>
      dataSource={employeesDataSource}
      dataSourceCache={employeesCache}
      rootPath="/employees"
      initialPageSize={20}
      defaultValues={{ title: 'New Employee' }}
      slots={{
        list: {
          dataGrid: CustomDataGrid,
        },
      }}
    />
  );
}
