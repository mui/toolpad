import * as React from 'react';
import { styled } from '@mui/material';
import { StudioPage } from '../../types';
import renderPageAsCode from '../../renderPageAsCode';

const PageViewRoot = styled('div')({
  overflow: 'auto',
});

const dependencies: {
  [source: string]: (() => Promise<any>) | undefined;
} = {
  react: () => import('react'),
  '@mui/material': () => import('@mui/material'),
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

export interface PageViewHandle {
  getRootElm: () => HTMLElement | null;
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
  ref: React.ForwardedRef<PageViewHandle>,
) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [result, setResult] = React.useState<{ App: React.FC }>({ App: Noop });

  React.useImperativeHandle(ref, () => ({
    getRootElm() {
      return rootRef.current;
    },
  }));

  const renderedPage = React.useMemo(() => {
    return renderPageAsCode(page, {
      editor: true,
      inlineQueries: true,
      transforms: ['jsx', 'typescript', 'imports'],
    });
  }, [page]);

  React.useEffect(() => {
    let canceled = false;
    loadDependencies(renderedPage.dependencies).then((importedModules) => {
      if (canceled) {
        return;
      }

      const run = new Function('require', 'module', 'exports', renderedPage.code);

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
    <PageViewRoot ref={rootRef} className={className}>
      <result.App />
    </PageViewRoot>
  );
});
