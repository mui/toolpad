'use client';
import * as React from 'react';
import { Crud } from '@toolpad/core/Crud';
import { useParams } from 'next/navigation';
import { employeesDataSource, Employee, employeesCache } from '../../../../data/employees';

export default function EmployeesCrudPage() {
  const params = useParams();
  const [employeeId] = params.segments ?? [];

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
