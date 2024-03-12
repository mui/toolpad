import * as React from 'react';
import { Tabs as MUITabs, Tab } from '@mui/material';
import createBuiltin from './createBuiltin';

interface TabProps {
  title: string;
  name: string;
}

interface TabsProps {
  value: string;
  onChange: (value: number) => void;
  tabs: TabProps[];
  defaultValue: string;
}

function Tabs({ value, onChange, tabs, defaultValue }: TabsProps) {
  return (
    <MUITabs
      value={value || defaultValue}
      onChange={(event, newValue) => {
        onChange(newValue);
      }}
    >
      {tabs.map(({ title, name }) => (
        <Tab label={title} value={name} key={name} />
      ))}
    </MUITabs>
  );
}

export default createBuiltin(Tabs, {
  helperText: 'The Material UI [Tabs](https://mui.com/material-ui/react-tabs/) component.',
  layoutDirection: 'horizontal',
  argTypes: {
    value: {
      type: 'string',
      onChangeProp: 'onChange',
      defaultValueProp: 'defaultValue',
      helperText: 'Currently active tab.',
    },
    defaultValue: {
      label: 'Default active tab',
      type: 'string',
      default: 'tab-one',
      helperText: 'The tab which will be active by default.',
    },
    tabs: {
      type: 'array',
      default: [
        {
          title: 'Tab one',
          name: 'tab-one',
        },
        { title: 'Tab two', name: 'tab-two' },
        { title: 'Tab three', name: 'tab-three' },
      ],
      helperText: 'Tabs configuration object.',
    },
  },
});
