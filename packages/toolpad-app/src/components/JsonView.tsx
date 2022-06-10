import * as React from 'react';
import Box from '@mui/material/Box';
import { ObjectInspector, ObjectInspectorProps, ObjectValue, ObjectLabel } from 'react-inspector';

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

export interface JsonViewProps {
  src: unknown;
  disabled?: boolean;
}

export default function JsonView({ src, disabled }: JsonViewProps) {
  // TODO: elaborate on this to show a nice default, but avoid expanding massive amount of objects
  const expandPaths = Array.isArray(src) ? ['$', '$.0', '$.1', '$.2', '$.3', '$.4'] : undefined;
  return (
    <Box
      sx={{
        whiteSpace: 'nowrap',
        opacity: disabled ? 0.5 : 'default',
      }}
    >
      <ObjectInspector
        nodeRenderer={nodeRenderer}
        expandLevel={1}
        expandPaths={expandPaths}
        data={src}
      />
    </Box>
  );
}
