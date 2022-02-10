import React from 'react';

export function createEngine() {
  const registerElement = (nodeId: NodeId) => {
    const deregister = () => {};
    return deregister;
  };

  const useComponentprops = (nodeId: NodeId, component: StudioComponent) => {
    const [props, setProps] = React.useState({});
    React.useEffect(() => {
      return registerElement(nodeId, component, setProps);
    }, [nodeId, component]);
    return props;
  };

  const useExpression = (expression: string) => {
    return {
      value,
      error,
    };
  };

  return {
    useComponentprops,
  };
}
