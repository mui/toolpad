import * as React from 'react';
import jsonToTs from 'json-to-ts';
import { Skeleton, styled, SxProps } from '@mui/material';
import { WithControlledProp, GlobalScopeMeta } from '../../../utils/types';
import lazyComponent from '../../../utils/lazyComponent';
import { hasOwnProperty } from '../../../utils/collections';

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
  extraDeclarations?: string;
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
  extraDeclarations = '',
}: JsExpressionEditorProps) {
  const extraLibs = React.useMemo(() => {
    const type = jsonToTs(globalScope);

    const globalDeclarations = Object.keys(globalScope).map((key) => {
      const metaData = hasOwnProperty(globalScopeMeta, key) ? globalScopeMeta[key] : {};
      const { deprecated, description } = metaData;

      const commentLines = [];

      if (description) {
        commentLines.push(description);
      }

      if (typeof deprecated === 'boolean') {
        commentLines.push('@deprecated');
      } else if (typeof deprecated === 'string') {
        commentLines.push(`@deprecated ${deprecated}`);
      }

      const comment =
        commentLines.length > 0 ? ['/**', ...commentLines.map((line) => ` * ${line}`), ' */'] : [];

      return [...comment, `declare const ${key}: RootObject[${JSON.stringify(key)}];`].join('\n');
    });

    const content = `
      ${type.join('\n')}

      ${globalDeclarations.join('\n')}
      
      ${extraDeclarations}
    `;

    return [{ content, filePath: 'global.d.ts' }];
  }, [globalScope, globalScopeMeta, extraDeclarations]);

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
