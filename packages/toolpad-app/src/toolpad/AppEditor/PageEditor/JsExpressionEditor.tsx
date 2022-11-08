import * as React from 'react';
import jsonToTs from 'json-to-ts';
import { Skeleton, styled, SxProps } from '@mui/material';
import { WithControlledProp, GlobalScopeMeta } from '../../../utils/types';
import lazyComponent from '../../../utils/lazyComponent';
import { hasOwnProperty } from '../../../utils/collections';
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
  const element = React.useContext(ElementContext);

  const nodeName = element?.name;

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

    const valueKeys = new Set(Object.keys(globalScope));
    const extraGlobalKeys = Object.keys(globalScopeMeta).filter((key) => !valueKeys.has(key));

    const extraDeclarationLines: string[] = [];
    for (const key of extraGlobalKeys) {
      const { tsType } = globalScopeMeta[key];
      if (tsType) {
        extraDeclarationLines.push(`declare const ${key}: ${tsType}`);
      }
    }

    const content = `
      ${type.join('\n')}

      ${globalDeclarations.join('\n')}

      ${nodeName ? `type ThisComponent = typeof ${nodeName}` : ''}
      
      ${extraDeclarationLines.join('\n')}
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
