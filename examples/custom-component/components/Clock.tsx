import * as React from 'react';
import { createComponent } from '@toolpad/studio/browser';

function getCurrentTime() {
  return new Date().toLocaleTimeString();
}

export interface ClockProps {
  label: string;
}

function Clock({ label }: ClockProps) {
  const [time, setTime] = React.useState(() => getCurrentTime());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCurrentTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {label}: {time}
    </div>
  );
}

export default createComponent(Clock, {
  argTypes: {
    label: {
      type: 'string',
      default: 'Current time',
    },
  },
});
