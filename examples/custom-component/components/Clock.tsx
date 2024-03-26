import * as React from 'react';
import { createComponent } from '@toolpad/studio/browser';

export interface ClockProps {
  msg: string;
}

function Clock({ msg }: ClockProps) {
  const [time, setTime] = React.useState(() => new Date().toLocaleTimeString());
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div>
      {msg}: {time}
    </div>
  );
}

export default createComponent(Clock, {
  argTypes: {
    msg: {
      type: 'string',
      default: 'Current time',
    },
  },
});
