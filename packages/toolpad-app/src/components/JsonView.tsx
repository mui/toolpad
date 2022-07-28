import * as React from 'react';
import { SxProps, styled } from '@mui/material';
import { ObjectInspector, ObjectInspectorProps, ObjectValue, ObjectLabel } from 'react-inspector';
import inspectorTheme from '../inspectorTheme';

const nodeRenderer: ObjectInspectorProps['nodeRenderer'] = ({
  depth,
  name,
  data,
  isNonenumerable,
}) => {
  return depth === 0 ? (
    <ObjectValue object={data} />
  ) : (
    <ObjectLabel name={name} data={data} isNonenumerable={isNonenumerable} />
  );
};

const JsonViewRoot = styled('div')({
  whiteSpace: 'nowrap',

  fontSize: 12,
  lineHeight: 1.2,
  fontFamily: 'Consolas, Menlo, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
});

export interface JsonViewProps {
  src: unknown;
  sx?: SxProps;
}

export default function JsonView({ src, sx }: JsonViewProps) {
  // TODO: elaborate on this to show a nice default, but avoid expanding massive amount of objects
  const expandPaths = Array.isArray(src) ? ['$', '$.0', '$.1', '$.2', '$.3', '$.4'] : undefined;
  return (
    <JsonViewRoot sx={sx}>
      <ObjectInspector
        nodeRenderer={nodeRenderer}
        expandLevel={1}
        expandPaths={expandPaths}
        data={src}
        theme={inspectorTheme}
      />
    </JsonViewRoot>
  );
}
