import * as React from 'react';
import jsonToTs from 'json-to-ts';
import { Skeleton, styled, SxProps } from '@mui/material';
import { isString } from 'lodash-es';
import { WithControlledProp, GlobalScopeMeta } from '../../../utils/types';
import lazyComponent from '../../../utils/lazyComponent';

const TypescriptEditor = lazyComponent(() => import('../../../components/TypescriptEditor'), {
  noSsr: true,
  fallback: <Skeleton variant="rectangular" height="100%" />,
});

const JsExpressionEditorRoot = styled('div')(({ theme }) => ({
  height: 150,
  border: `1px solid ${theme.palette.divider}`,
}));

export interface JsExpressionEditorProps extends WithControlledProp<string> {
  globalScope?: Record<string, unknown>;
  globalScopeMeta?: GlobalScopeMeta;
  disabled?: boolean;
  autoFocus?: boolean;
  functionBody?: boolean;
  topLevelAwait?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  sx?: SxProps;
}

export function JsExpressionEditor({
  value,
  onChange,
  globalScope = {},
  globalScopeMeta = {},
  disabled,
  autoFocus,
  functionBody,
  topLevelAwait,
  onFocus,
  onBlur,
  sx,
}: JsExpressionEditorProps) {
  const extraLibs = React.useMemo(() => {
    const type = jsonToTs(globalScope);

    const globals = Object.keys(globalScope)
      .map((key) => {
        let declaration = ``;
        const metaData = globalScopeMeta[key] || {};

        if (metaData.description) {
          declaration = `/** ${metaData.description} */`;
        }

        if (metaData.deprecated) {
          const deprecated = metaData.deprecated;

          declaration = `
            ${declaration}
            ${
              isString(deprecated)
                ? `/** @deprecated ${metaData.deprecated} */`
                : `/** @deprecated */`
            }
          `;
        }

        declaration = `
          ${declaration}
          declare const ${key}: RootObject[${JSON.stringify(key)}];
        `;

        return declaration;
      })
      .join('\n');

    const content = `
      ${type.join('\n')}

      ${globals}
      
    `;

    return [{ content, filePath: 'file:///node_modules/@mui/toolpad/index.d.ts' }];
  }, [globalScope, globalScopeMeta]);

  return (
    <JsExpressionEditorRoot sx={sx}>
      <TypescriptEditor
        value={value}
        onChange={(code = '') => onChange(code)}
        disabled={disabled}
        extraLibs={extraLibs}
        functionBody={functionBody}
        topLevelAwait={topLevelAwait}
        onFocus={onFocus}
        onBlur={onBlur}
        autoFocus={autoFocus}
      />
    </JsExpressionEditorRoot>
  );
}
