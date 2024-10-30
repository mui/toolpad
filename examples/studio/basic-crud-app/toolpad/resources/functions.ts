let nextId = 1;

function generateId(): number {
  const id = nextId;
  nextId += 1;
  return id;
}

interface Customer {
  id: number;
  name?: string;
  account_creation_date?: string;
  country_of_residence?: string;
  phone_number?: number;
  email?: string;
  address?: string;
  gender?: string;
}

const customers: Customer[] = [
  {
    id: generateId(),
    name: 'Emily Lee',
    account_creation_date: '2022-03-15',
    country_of_residence: 'Brazil',
    phone_number: 9876543210,
    email: 'emilylee@example.com',
    address: '123 Main St, Sao Paulo, Brazil',
    gender: 'Female',
  },
  {
    id: generateId(),
    name: 'Liam Patel',
    account_creation_date: '2022-02-02',
    country_of_residence: 'India',
    phone_number: 8765432109,
    email: 'liampatel@example.com',
    address: '456 Park Rd, Mumbai, India',
    gender: 'Male',
  },
  {
    id: generateId(),
    name: 'Emma Garcia',
    account_creation_date: '2022-01-23',
    country_of_residence: 'Spain',
    phone_number: 7654321098,
    email: 'emmagarcia@example.com',
    address: '789 Oak Ave, Madrid, Spain',
    gender: 'Female',
  },
  {
    id: generateId(),
    name: 'William Wong',
    account_creation_date: '2022-04-08',
    country_of_residence: 'United States',
    phone_number: 6543210987,
    email: 'williamwong@example.com',
    address: '456 Elm St, San Francisco, CA, USA',
    gender: 'Male',
  },
  {
    id: generateId(),
    name: 'Ava Kim',
    account_creation_date: '2022-02-14',
    country_of_residence: 'South Korea',
    phone_number: 5432109876,
    email: 'avakim@example.com',
    address: '321 Maple St, Seoul, South Korea',
    gender: 'Female',
  },
  {
    id: generateId(),
    name: 'Ethan Chen',
    account_creation_date: '2022-03-01',
    country_of_residence: 'China',
    phone_number: 4321098765,
    email: 'ethanchen@example.com',
    address: '789 Pine Rd, Beijing, China',
    gender: 'Male',
  },
];

export async function getCustomers() {
  return customers;
}

export async function addCustomer(values: Omit<Customer, 'id'>) {
  const newCustomer = { id: generateId(), ...values };
  customers.push(newCustomer);
  return newCustomer;
}

export async function updateCustomer(id: number, values: Omit<Customer, 'id'>) {
  const index = customers.findIndex((item) => item.id === id);

  if (customers[index]) {
    Object.assign(customers[index], values);
  }

  return customers[index];
}

export async function deleteCustomer(id: number) {
  const index = customers.findIndex((item) => item.id === id);
  customers.splice(index, 1);
}
