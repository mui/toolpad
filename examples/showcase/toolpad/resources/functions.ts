import { createFunction } from '@mui/toolpad/server';

let nextId = 1;

function generateId() {
  const id = nextId;
  nextId += 1;
  return id;
}

const customers = [
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

const customerProperties = {
  name: {
    type: 'string',
  },
  account_creation_date: {
    type: 'string',
  },
  country_of_residence: {
    type: 'string',
  },
  phone_number: {
    type: 'number',
  },
  email: {
    type: 'string',
  },
  address: {
    type: 'string',
  },
  gender: {
    type: 'string',
    enum: ['Male', 'Female', 'Other'],
  },
} as const;

export const addCustomer = createFunction(
  async ({ parameters }) => {
    const newCustumer = {
      id: generateId(),
      ...parameters.customer,
    };
    customers.push(newCustumer);
    return newCustomer;
  },
  {
    parameters: {
      customer: {
        type: 'object',
        schema: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            ...customerProperties,
          },
        },
      },
    },
  },
);

export const updateCustomer = createFunction(
  async ({ parameters }) => {
    const index = customers.findIndex((item) => item.id === parameters.customer.id);

    if (customers[index]) {
      Object.assign(customers[index], parameters.customer);
    }

    return customers[index];
  },
  {
    parameters: {
      customer: {
        type: 'object',
        schema: {
          type: 'object',
          properties: customerProperties,
        },
      },
    },
  },
);

export const deleteCustomer = createFunction(
  async ({ parameters }) => {
    const index = customers.findIndex((item) => item.id === parameters.id);
    customers.splice(index, 1);
  },
  {
    parameters: {},
  },
);
