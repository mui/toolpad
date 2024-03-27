import * as React from 'react';
import { createComponent } from '@toolpad/studio/browser';

function getCurrentTime() {
  return new Date().toLocaleTimeString();
}

export interface ClockProps {
  msg: string;
}

function Clock({ msg }: ClockProps) {
  const [time, setTime] = React.useState(() => getCurrentTime());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCurrentTime());
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
