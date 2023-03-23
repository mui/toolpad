import * as React from 'react';
import jsonToTs from 'json-to-ts';
import { Skeleton, styled, SxProps } from '@mui/material';
import { ScopeMeta } from '@mui/toolpad-core';
import { WithControlledProp } from '../../../utils/types';
import lazyComponent from '../../../utils/lazyComponent';
import ElementContext from '../ElementContext';

const TypescriptEditor = lazyComponent(() => import('../../../components/TypescriptEditor'), {
  noSsr: true,
  fallback: <Skeleton variant="rectangular" height="100%" />,
});

const JsExpressionEditorRoot = styled('div')(({ theme }) => ({
  height: 150,
  border: `1px solid ${theme.palette.divider}`,
}));

export interface JsExpressionEditorProps extends WithControlledProp<string> {
  globalScope: Record<string, unknown>;
  globalScopeMeta: ScopeMeta;
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
  globalScope,
  globalScopeMeta,
  disabled,
  autoFocus,
  functionBody,
  topLevelAwait,
  onFocus,
  onBlur,
  sx,
}: JsExpressionEditorProps) {
  const element = React.useContext(ElementContext);

  const nodeName = element?.name;

  const extraLibs = React.useMemo(() => {
    const generatedTypes = jsonToTs(globalScope);

    const globalDeclarations = Object.entries(globalScopeMeta).map(([key, metaData = {}]) => {
      const { deprecated, description, tsType } = metaData;

      const commentLines: string[] = [];

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

      const declaration = tsType
        ? `declare const ${key}: ${tsType}`
        : `declare const ${key}: RootObject[${JSON.stringify(key)}];`;
      return [...comment, declaration].join('\n');
    });

    const content = `
      ${generatedTypes.join('\n')}

      ${globalDeclarations.join('\n')}

      ${nodeName ? `type ThisComponent = typeof ${nodeName}` : ''}
    `;

    return [{ content, filePath: 'global.d.ts' }];
  }, [globalScope, globalScopeMeta, nodeName]);

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
