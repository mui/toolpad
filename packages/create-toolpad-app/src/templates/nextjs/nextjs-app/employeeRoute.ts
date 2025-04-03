const route = `import { NextRequest, NextResponse } from 'next/server';
import { getEmployeesStore, setEmployeesStore } from '../../../../employeesStore';
import type { Employee } from '../../../../data/employees';
import type { OmitId } from '@toolpad/core/Crud';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id: employeeId } = params;

  const employeesStore = getEmployeesStore();

  const employeeToShow = employeesStore.find((employee) => employee.id === Number(employeeId));

  if (!employeeToShow) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }
  return NextResponse.json(employeeToShow);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body: Partial<OmitId<Employee>> = await req.json();
  const { id: employeeId } = params;

  const employeesStore = getEmployeesStore();

  let updatedEmployee: Employee | null = null;

  setEmployeesStore(
    employeesStore.map((employee) => {
      if (employee.id === Number(employeeId)) {
        updatedEmployee = { ...employee, ...body };
        return updatedEmployee;
      }
      return employee;
    }),
  );

  if (!updatedEmployee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }
  return NextResponse.json(updatedEmployee);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id: employeeId } = params;

  const employeesStore = getEmployeesStore();

  setEmployeesStore(employeesStore.filter((employee) => employee.id !== Number(employeeId)));

  return NextResponse.json({ success: true });
}
`;

export default route;
