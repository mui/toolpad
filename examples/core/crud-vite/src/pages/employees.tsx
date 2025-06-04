import * as React from 'react';
import { Crud } from '@toolpad/core/Crud';
import { useParams } from 'react-router';
import { employeesDataSource, Employee, employeesCache } from '../data/employees';

export default function EmployeesCrudPage() {
  const { employeeId } = useParams();

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
