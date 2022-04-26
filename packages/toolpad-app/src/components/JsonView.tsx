import * as React from 'react';
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
}

export default function JsonView({ src }: JsonViewProps) {
  // TODO: elaborate on this to show a nice default, but avoid expanding massive amount of objects
  const expandPaths = Array.isArray(src) ? ['$', '$.0', '$.1', '$.2', '$.3', '$.4'] : undefined;
  return (
    <div style={{ whiteSpace: 'nowrap' }}>
      <ObjectInspector
        nodeRenderer={nodeRenderer}
        expandLevel={1}
        expandPaths={expandPaths}
        data={src}
      />
    </div>
  );
}
