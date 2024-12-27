---
productId: toolpad-core
title: Sign-up Page
components: SignUpPage
---

# Sign-up Page

<p class="description">A customizable sign-up component that abstracts away the pain needed to wire together a secure sign-up/register page for your application.</p>

:::info
If this is your first time using Toolpad Core, it's recommended to read about the [basic concepts](/toolpad/core/introduction/base-concepts/) first.
:::

## Basic usage

```jsx
import { SignUpPage } from '@toolpad/core';

export default function App() {
  return (
    <SignUpPage
      onSubmit={(data) => console.log(data)}
      providers={['google', 'github']}
    />
  );
}
```

## Props

### Required props

| Name       | Type                         | Description                                |
| ---------- | ---------------------------- | ------------------------------------------ |
| `onSubmit` | `(data: SignUpData) => void` | Callback fired when the form is submitted. |

### Optional props

| Name          | Type        | Default     | Description                                                                                      |
| ------------- | ----------- | ----------- | ------------------------------------------------------------------------------------------------ |
| `providers`   | `string[]`  | `[]`        | List of OAuth providers to display. Supported values: 'google', 'github', 'twitter', 'facebook'. |
| `title`       | `string`    | `'Sign up'` | The title displayed at the top of the page.                                                      |
| `logo`        | `ReactNode` | `undefined` | Custom logo to display above the form.                                                           |
| `theme`       | `Theme`     | `undefined` | Custom theme object to override default styles.                                                  |
| `redirectUrl` | `string`    | `'/'`       | URL to redirect to after successful sign-up.                                                     |
| `loading`     | `boolean`   | `false`     | Whether to show loading state.                                                                   |
| `error`       | `string`    | `undefined` | Error message to display.                                                                        |

## Examples

### Basic sign-up with email/password

```jsx
import { SignUpPage } from '@toolpad/core';

export default function SignUp() {
  const handleSignUp = async (data) => {
    try {
      await createUser(data);
      // Handle successful sign-up
    } catch (error) {
      // Handle error
    }
  };

  return <SignUpPage onSubmit={handleSignUp} />;
}
```

### With OAuth providers

```jsx
import { SignUpPage } from '@toolpad/core';

export default function SignUp() {
  return (
    <SignUpPage
      onSubmit={handleSignUp}
      providers={['google', 'github', 'twitter']}
      title="Join our platform"
      redirectUrl="/dashboard"
    />
  );
}
```

### Custom styling

```jsx
import { SignUpPage } from '@toolpad/core';

const customTheme = {
  colors: {
    primary: '#1976d2',
    background: '#f5f5f5',
  },
  borderRadius: '8px',
};

export default function SignUp() {
  return (
    <SignUpPage
      onSubmit={handleSignUp}
      theme={customTheme}
      logo={<img src="/logo.png" alt="Company Logo" />}
    />
  );
}
```

## Form Fields

The default sign-up form includes the following fields:

- Email (required)
- Password (required)
- Confirm Password (required)
- Name (optional)

## TypeScript

The component includes full TypeScript support. Here are the main types you'll work with:

```ts
interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

interface SignUpPageProps {
  onSubmit: (data: SignUpData) => void;
  providers?: string[];
  title?: string;
  logo?: ReactNode;
  theme?: Theme;
  redirectUrl?: string;
  loading?: boolean;
  error?: string;
}
```

## Customization

### Custom Form Fields

You can extend the default form fields using the `fields` prop:

```jsx
const customFields = [
  {
    name: 'company',
    label: 'Company Name',
    type: 'text',
    required: true,
  },
  {
    name: 'role',
    label: 'Job Role',
    type: 'select',
    options: ['Developer', 'Designer', 'Manager'],
  },
];

<SignUpPage onSubmit={handleSignUp} fields={customFields} />;
```

### Custom Validation

The component uses Yup for form validation. You can provide custom validation rules:

```jsx
const validationSchema = {
  email: (value) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value),
  password: (value) => value.length >= 8,
};

<SignUpPage onSubmit={handleSignUp} validation={validationSchema} />;
```

## Best Practices

1. Always handle errors gracefully and display meaningful error messages to users.
2. Implement proper security measures on your backend to validate and sanitize user input.
3. Consider implementing rate limiting to prevent abuse.
4. Use HTTPS to secure data transmission.
5. Follow accessibility guidelines by maintaining proper contrast and keyboard navigation.

## Related Components

- [`SignInPage`](/toolpad/core/react-sign-in-page/) - For user login
- [`PasswordResetPage`](/toolpad/core/react-password-reset-page/) - For password recovery
- [`AuthProvider`](/toolpad/core/react-auth-provider/) - For managing authentication state

## API Reference

For a complete list of props and methods, see the [API Reference](/toolpad/core/api-reference/#sign-up-page).
