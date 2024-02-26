# Pages

<p class="description">Toolpad provides a default dashboard layout that contains navigation and and authentication controls</p>

## A sample page

```tsx
// app/layout.tsx
import { DashBoardLayout } from '@mui/toolpad';

const navigation = [
    {
        category: 'HR'
        children: [
            {
                title: 'Employees',
                path: '/employees',
                icon: <PersonIcon />
            },
            {
                title: 'Customer',
                path: '/customers'
            },
        ]
    },
    {
        category: 'Sales'
    },
]

export default function Layout(props) {
    return (
        <DashBoardLayout navigation={navigation}>
            {props.children}
        </DashBoardLayout>
  );
}
```

## Customization

```tsx
function Auth () {
 return <><Avatar><Menu>...</Menu></>
}

export default function Layout ({ children }) {
  return (
  <DashBoardLayout
    navigation={navigation}
    slots={{
    Auth,
    SideNav,
        ...
   }}
  >
   {children}
  </DashBoardLayout>
 )
}
```

## Auto infer page structure

## Dialogs

```tsx
interface UseDialogs {
  prompt: (msg: React.ReactNode, opts) => Promise<R>;
  alert: (msg: React.ReactNode, opts) => Promise<void>;
  confirm: (msg: React.ReactNode, opts) => Promise<boolean>;
  show: (content: Recat.ComponentType, payload: any) => Promise<R>;
}

function useDialogs(): UseDialogs;
```

Toolpad takes care of mounting and stacking dialogs. These helpers allow for

- creating prompt, alert, confirm dialogs, similar to the browser native ones, but within the MUI theme
- imperatively showing a dialog with a payload and an async result

## Notifications

## dialogs/notifications example

```tsx
const dialogs = useDialogs();
const notifications = useNotifications();

const handleSave = React.useCallback(async () => {
  try {
    await saveRecord(record);
  } catch (err) {
    if (err.code === 'ALREADY_EXISTS') {
      const force = await dialogs.confirm('Record already exists, overwrite?');
      if (force) {
        await saveRecord(record, { force: true });
      } else {
        await notifications.enqueue(`Canceled saving record.`);
      }
      return;
    }

    await notifications.enqueue(`Error while saving: ${err.code}.`);
  }
}, [dialogs, notifications, record]);
```
