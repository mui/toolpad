import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Crud } from '@toolpad/core/Crud';
import { employeesDataSource, Employee, employeesCache } from '../data/employees';

export default function EmployeesCrudPage() {
  return (
    <Crud<Employee>
      dataSource={employeesDataSource}
      dataSourceCache={employeesCache}
      rootPath="/employees"
      initialPageSize={25}
      defaultValues={{ itemCount: 1 }}
    />
  );
}

export const Route = createFileRoute('/_layout/employees/$')({
  component: EmployeesCrudPage,
});
