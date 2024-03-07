# Authentication

<p class="description">Toolpad provides working authentication out of the box, with support for multiple providers</p>

## Setup authentication pages

```tsx
// app/auth/[page]/page.tsx
import { AuthPages } from '@mui/toolpad/auth';

export default function Auth() {
  return <AuthPages />;
}
```

This will create routes for:

- `/auth/signin`
- `/auth/signout`
- `/auth/error`
- `/auth/verify-request`
- `/auth/new-user`

```tsx
import { getAuthPages } from '@mui/toolpad/auth'

...
  pages: getAuthPages('/auth')
...
```

## RBAC (🌟)

<aside>
❓ More research and benchmarks needed to shape an API that is flexible and ergonomic for the 90% use case. This proposal is just to give an idea of the concept

</aside>

An authorization context can be created:

```tsx
// app/layout.tsx
import { AuthorizationProvider } from '@mui/toolpad/auth';

function getRolesFromUser(user) {
  return user.roles;
}

export default function Layout() {
  return <AuthorizationProvider getRolesFromUser={getRolesFromUser} />;
}
```

Will create a component that you can wrap around your page to make it only accessible for specific users.

```tsx
// app/hr/page.tsx
import { Authorized } from '@mui/toolpad/auth';

export default function Auth() {
  return <Authorized role={['admin', 'hr']} />;
}
```

Will add RBAC to the DataSources so that you can enforce it at the data level. In the following examples, only users with the `admin` role will be able to update the sheet through the grid. But users with the `guest` role will be able to view:

```tsx
import { createDataProviderGoogleSheets } from '@mui/toolpad-data-google-sheets'

const dataSource = createDataProviderGoogleSheets({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    sheet: 'my-sheet',
    authorization: {
        getRows: ['admin', 'guest'],
        createRow: ['admin']
    }
})

...
  const dataGridProps = useDataGrid(dataSource)
  <DataGrid {...dataGridProps} />
...
```
