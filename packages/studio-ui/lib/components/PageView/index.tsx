import * as React from 'react';
import { styled } from '@mui/material';
import { transform } from 'sucrase';
import { getRelativeBoundingBox, rectContainsPoint } from '../../utils/geometry';
import { StudioPage, NodeLayout, NodeId } from '../../types';
import { DATA_PROP_NODE_ID } from '../../constants';
import renderPageAsCode from '../../renderPageAsCode';

const PageViewRoot = styled('div')({});

export function getNodeLayout(viewElm: HTMLElement, elm: HTMLElement): NodeLayout | null {
  const nodeId = (elm.getAttribute(DATA_PROP_NODE_ID) as NodeId | undefined) || null;
  if (nodeId) {
    return {
      nodeId,
      rect: getRelativeBoundingBox(viewElm, elm),
      slots: [],
    };
  }
  return null;
}

export function getViewCoordinates(
  viewElm: HTMLElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const rect = viewElm.getBoundingClientRect();
  if (rectContainsPoint(rect, clientX, clientY)) {
    return { x: clientX - rect.x, y: clientY - rect.y };
  }
  return null;
}

const dependencies: {
  [source: string]: (() => Promise<any>) | undefined;
} = {
  react: () => import('react'),
  '@mui/material/Box': () => import('@mui/material/Box'),
  '@mui/material/Button': () => import('@mui/material/Button'),
  '@mui/x-data-grid': () => import('@mui/x-data-grid'),
  '@mui/material/Container': () => import('@mui/material/Container'),
  '@mui/material/Stack': () => import('@mui/material/Stack'),
  '@mui/material/Paper': () => import('@mui/material/Paper'),
  '@mui/material/TextField': () => import('@mui/material/TextField'),
};

async function loadDependencies(moduleIds: string[]): Promise<any> {
  return Object.fromEntries(
    await Promise.all(
      moduleIds.map(async (moduleId) => {
        const loader = dependencies[moduleId];
        if (!loader) {
          throw new Error(`Unsupported module imported "${moduleId}"`);
        }
        return [moduleId, await loader()];
      }),
    ),
  );
}

export interface PageViewProps {
  className?: string;
  // Callback for when the view has rendered. Make sure this value is stable
  onAfterRender?: () => void;
  page: StudioPage;
}

function Noop() {
  return <React.Fragment />;
}

export default React.forwardRef(function PageView(
  { className, page, onAfterRender }: PageViewProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const [result, setResult] = React.useState<{ App: React.FC }>({ App: Noop });

  const renderedPage = React.useMemo(() => {
    return renderPageAsCode(page, { editor: true });
  }, [page]);

  React.useEffect(() => {
    let canceled = false;
    loadDependencies(renderedPage.dependencies).then((importedModules) => {
      if (canceled) {
        return;
      }

      console.log(renderedPage.code, importedModules);

      const { code: compiledCode } = transform(renderedPage.code, {
        transforms: ['jsx', 'typescript', 'imports'],
      });

      const run = new Function('require', 'module', 'exports', compiledCode);

      const require = (moduleId: string) => {
        return importedModules[moduleId];
      };
      const mod = {
        exports: {
          default: (() => null) as React.FC,
        },
      };
      run(require, mod, mod.exports);
      const App = mod.exports.default;

      setResult({ App });
    });

    return () => {
      canceled = true;
    };
  }, [renderedPage]);

  React.useEffect(() => {
    onAfterRender?.();
  }, [onAfterRender, result.App]);

  return (
    <PageViewRoot ref={ref} className={className}>
      <result.App />
    </PageViewRoot>
  );
});
