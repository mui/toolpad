import * as React from 'react';
import {
  ObjectInspector as ReactObjectInspector,
  ObjectInspectorProps,
  chromeDark,
  chromeLight,
  InspectorTheme,
} from 'react-inspector';
import { useTheme } from '@mui/material/styles';

const useInspectorTheme = (): InspectorTheme => {
  const theme = useTheme();
  return React.useMemo(() => {
    return {
      ...(theme.palette.mode === 'dark' ? chromeDark : chromeLight),
      BASE_BACKGROUND_COLOR: 'inherit',
      TREENODE_FONT_FAMILY: 'inherit',
      TREENODE_FONT_SIZE: 'inherit',
      ARROW_FONT_SIZE: 'inherit',
      TREENODE_LINE_HEIGHT: 'inherit',
    };
  }, [theme]);
};

export type { ObjectInspectorProps };

export default (function ObjectInspector(props: ObjectInspectorProps) {
  const inspectorTheme = useInspectorTheme();
  return <ReactObjectInspector theme={inspectorTheme} {...props} />;
});
