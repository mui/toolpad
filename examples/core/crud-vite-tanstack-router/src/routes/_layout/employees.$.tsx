import * as React from 'react';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { Crud } from '@toolpad/core/Crud';
import { employeesDataSource, Employee, employeesCache } from '../../data/employees';

export default function EmployeesCrudPage() {
  const { _splat } = useParams({ strict: false });
  const employeeId = _splat?.split('/')[0];

  return (
    <Crud<Employee>
      dataSource={employeesDataSource}
      dataSourceCache={employeesCache}
      rootPath="/employees"
      initialPageSize={25}
      defaultValues={{ itemCount: 1 }}
      pageTitles={{
        show: `Employee ${employeeId}`,
        create: 'New Employee',
        edit: `Employee ${employeeId} - Edit`,
      }}
    />
  );
}

export const Route = createFileRoute('/_layout/employees/$')({
  component: EmployeesCrudPage,
});
