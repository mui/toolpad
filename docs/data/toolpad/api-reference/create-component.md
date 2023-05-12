# createComponent

<p class="description">Build custom components and expose to Toolpad.</p>

## Custom Components

By convention, Toolpad custom components are placed inside of the `toolpad/components/` folder. Each file in this folder describes one custom Toolpad component. As soon as the file exports a valid custom component in its default export it will be available in Toolpad to be used in UI.

## Example

```tsx
// ./toolpad/components/MyMessage.tsx
import { createComponent } from '@mui/toolpad/browser';

interface MyMessageProps {
  message: string;
}

function MyMessage({ message }: MyMessageProps) {
  return <Typography>{message}</Typography>;
}

export default createComponent(MyMessage, {
  argTypes: {
    message: {
      type: 'string',
      default: 'Hello World',
    },
  },
});
```
