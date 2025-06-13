import * as React from 'react';
import { useRouter } from 'next/router';
import { Crud } from '@toolpad/core/Crud';
import { employeesDataSource, Employee, employeesCache } from '../../data/employees';

export default function EmployeesCrudPage() {
  const router = useRouter();
  const { segments = [] } = router.query;
  const [employeeId] = segments;

  return router.isReady ? (
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
  ) : null;
}
