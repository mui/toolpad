import * as React from 'react';
import { transform } from 'sucrase';
import CodeComponent, { CodeComponentProps } from './CodeComponent';

/**
 * The lack of hookable ESM imports make pure ESM implelementation of code components hard.
 * This module prototypes a commonjs based implementation
 *
 * I will also investigate https://www.npmjs.com/package/ses
 */

export default React.forwardRef(function CodeComponentDev<P>(
  { code, ...props }: CodeComponentProps<P>,
  ref: React.ForwardedRef<typeof CodeComponent>,
) {
  const compiled = React.useMemo(() => {
    return transform(code, {
      transforms: ['jsx', 'typescript', 'imports'],
    });
  }, [code]);

  return (
    <CodeComponent
      // @ts-expect-error Upgrade @types/react
      ref={ref}
      code={compiled.code}
      {...props}
    />
  );
});
