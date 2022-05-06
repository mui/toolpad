import * as React from 'react';
import * as ReactIs from 'react-is';
import * as MuiMaterial from '@mui/material';

export interface CodeComponentProps<P = {}> {
  code: string;
  props: P;
}

export default React.forwardRef(function CodeComponent<P>(
  { code, props }: CodeComponentProps<P>,
  ref: React.ForwardedRef<React.ComponentType<P>>,
) {
  const Component: unknown = React.useMemo(() => {
    const modules = new Map<string, any>([
      ['react', React],
      ['@mui/material', MuiMaterial],
    ]);

    const require = (moduleId: string): unknown => {
      const module = modules.get(moduleId);
      if (module) {
        return module;
      }
      throw new Error(`Can't resolve module "${moduleId}"`);
    };

    const exports: any = {};

    const globals = {
      exports,
      module: { exports },
      require,
    };

    const instantiateModuleCode = `
      (${Object.keys(globals).join(', ')}) => {
        ${code}
      }
    `;

    // eslint-disable-next-line no-eval
    const instantiateModule = eval(instantiateModuleCode);

    instantiateModule(...Object.values(globals));

    return exports.default;
  }, [code]);

  return ReactIs.isValidElementType(Component) ? <Component ref={ref} {...props} /> : null;
});
