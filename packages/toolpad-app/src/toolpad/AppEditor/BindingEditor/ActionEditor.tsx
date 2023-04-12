import { TabContext, TabList } from '@mui/lab';
import { Box, Tab } from '@mui/material';
import * as React from 'react';
import { BindableAttrValue, JsRuntime, LiveBinding, ScopeMeta } from '@mui/toolpad-core';
import { NavigationActionEditor } from './NavigationActionEditor';
import TabPanel from '../../../components/TabPanel';
import { Maybe, WithControlledProp } from '../../../utils/types';
import { BindableType, JsExpressionActionEditor } from '.';

function getActionTab(value: Maybe<BindableAttrValue<any>>) {
  return value?.type || 'jsExpressionAction';
}

export interface ActionEditorProps extends WithControlledProp<BindableAttrValue<any> | null> {
  globalScope: Record<string, unknown>;
  globalScopeMeta: ScopeMeta;
  jsRuntime: JsRuntime;
  liveBinding?: LiveBinding;
}

export function ActionEditor({
  value,
  onChange,
  globalScope,
  globalScopeMeta,
  jsRuntime,
  liveBinding,
}: ActionEditorProps) {
  const [activeTab, setActiveTab] = React.useState<BindableType>(getActionTab(value));
  React.useEffect(() => setActiveTab(getActionTab(value)), [value]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: BindableType) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleTabChange} aria-label="Choose action kind ">
            <Tab label="JS expression" value="jsExpressionAction" />
            <Tab label="Navigation" value="navigationAction" />
          </TabList>
        </Box>
        <TabPanel value="jsExpressionAction" disableGutters>
          <JsExpressionActionEditor
            value={value?.type === 'jsExpressionAction' ? value : null}
            onChange={onChange}
          />
        </TabPanel>
        <TabPanel value="navigationAction" disableGutters>
          <NavigationActionEditor
            value={value?.type === 'navigationAction' ? value : null}
            onChange={onChange}
            globalScope={globalScope}
            globalScopeMeta={globalScopeMeta}
            jsRuntime={jsRuntime}
            liveBinding={liveBinding}
          />
        </TabPanel>
      </TabContext>
    </Box>
  );
}
