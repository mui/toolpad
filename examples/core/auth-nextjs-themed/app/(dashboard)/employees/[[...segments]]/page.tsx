'use client';
import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CrudProvider, List, Create, Edit, Show } from '@toolpad/core/Crud';
import { employeesDataSource, Employee, employeesCache } from '../../../mocks/employees';
import CustomDataGrid from '../../../components/CustomDataGrid';

function matchPath(pattern: string, pathname: string): string | null {
  const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, '([^/]+)')}$`);
  const match = pathname.match(regex);
  return match ? match[1] : null;
}

export default function EmployeesCrudPage() {
  const pathname = usePathname();
  const router = useRouter();

  const rootPath = '/employees';
  const listPath = rootPath;
  const showPath = `${rootPath}/:employeeId`;
  const createPath = `${rootPath}/new`;
  const editPath = `${rootPath}/:employeeId/edit`;

  const showEmployeeId = matchPath(showPath, pathname);
  const editEmployeeId = matchPath(editPath, pathname);

  const handleRowClick = React.useCallback(
    (employeeId: string | number) => {
      console.log('Clicked on row with ID', employeeId);
      router.push(`${rootPath}/${String(employeeId)}`);
    },
    [router],
  );

  const handleCreateClick = React.useCallback(() => {
    router.push(createPath);
  }, [createPath, router]);

  const handleEditClick = React.useCallback(
    (employeeId: string | number) => {
      router.push(`${rootPath}/${String(employeeId)}/edit`);
    },
    [router],
  );

  const handleCreate = React.useCallback(() => {
    router.push(listPath);
  }, [listPath, router]);

  const handleEdit = React.useCallback(() => {
    router.push(listPath);
  }, [listPath, router]);

  const handleDelete = React.useCallback(() => {
    router.push(listPath);
  }, [listPath, router]);

  return (
    <CrudProvider<Employee> dataSource={employeesDataSource} dataSourceCache={employeesCache}>
      {pathname === listPath ? (
        <List<Employee>
          initialPageSize={25}
          onRowClick={handleRowClick}
          onCreateClick={handleCreateClick}
          onEditClick={handleEditClick}
          slots={{
            dataGrid: CustomDataGrid,
          }}
        />
      ) : null}
      {pathname === createPath ? (
        <Create<Employee>
          initialValues={{ title: 'New Employee' }}
          onSubmitSuccess={handleCreate}
          resetOnSubmit={false}
        />
      ) : null}
      {pathname !== createPath && showEmployeeId ? (
        <Show<Employee> id={showEmployeeId} onEditClick={handleEditClick} onDelete={handleDelete} />
      ) : null}
      {editEmployeeId ? <Edit<Employee> id={editEmployeeId} onSubmitSuccess={handleEdit} /> : null}
    </CrudProvider>
  );
}
