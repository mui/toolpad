import * as React from 'react';
import { styled } from '@mui/material';
import { NodeHashes, NodeId } from '@toolpad/studio-runtime';
import useEventCallback from '@mui/utils/useEventCallback';
import * as appDom from '@toolpad/studio-runtime/appDom';
import EditorCanvasHostLegacy from '../EditorCanvasHost';
import EditorCanvasHostInline from '../EditorCanvasHostInline';
import { getNodeHashes, useAppState, useAppStateApi, useDomApi } from '../../../AppState';
import { usePageEditorApi, usePageEditorState } from '../PageEditorProvider';
import RenderOverlay from './RenderOverlay';
import type { ToolpadBridge } from '../../../../canvas/ToolpadBridge';
import { getBindingType } from '../../../../runtime/bindings';
import createRuntimeState from '../../../../runtime/createRuntimeState';
import { RuntimeState } from '../../../../runtime';

const EditorCanvasHost = process.env.EXPERIMENTAL_INLINE_CANVAS
  ? EditorCanvasHostInline
  : EditorCanvasHostLegacy;

const classes = {
  view: 'Toolpad_View',
};

const RenderPanelRoot = styled('div')({
  position: 'relative',
  overflow: 'hidden',

  [`& .${classes.view}`]: {
    height: '100%',
  },
});

function useRuntimeState(): RuntimeState {
  const { dom } = useAppState();
  return React.useMemo(() => createRuntimeState({ dom }), [dom]);
}

export interface RenderPanelProps {
  className?: string;
}

export default function RenderPanel({ className }: RenderPanelProps) {
  const appState = useAppState();
  const domApi = useDomApi();
  const appStateApi = useAppStateApi();
  const pageEditorApi = usePageEditorApi();
  const { nodeId: pageNodeId } = usePageEditorState();
  const page = appDom.getNode(appState.dom, pageNodeId, 'page');

  const [bridge, setBridge] = React.useState<ToolpadBridge | null>(null);

  const savedNodes: NodeHashes = React.useMemo(
    () => getNodeHashes(appState.savedDom),
    [appState.savedDom],
  );

  const handleInit = useEventCallback((initializedBridge: ToolpadBridge) => {
    initializedBridge.canvasEvents.on('propUpdated', (event) => {
      domApi.update((draft) => {
        const node = appDom.getMaybeNode(draft, event.nodeId as NodeId, 'element');
        if (!node) {
          return draft;
        }

        const actual = node.props?.[event.prop];
        if (actual && getBindingType(actual) !== 'const') {
          console.warn(`Can't update a non-const prop "${event.prop}" on node "${node.id}"`);
          return draft;
        }

        const newValue: unknown =
          typeof event.value === 'function' ? event.value(actual) : event.value;

        draft = appDom.setNodeNamespacedProp(draft, node, 'props', event.prop, newValue);

        return draft;
      });
    });

    initializedBridge.canvasEvents.on('editorNodeDataUpdated', (event) => {
      pageEditorApi.nodeDataUpdate(event.nodeId, event.prop, event.value);
    });

    initializedBridge.canvasEvents.on('pageStateUpdated', (event) => {
      pageEditorApi.pageStateUpdate(event.pageState, event.globalScopeMeta);
    });

    initializedBridge.canvasEvents.on('pageBindingsUpdated', (event) => {
      pageEditorApi.pageBindingsUpdate(event.bindings);
    });

    initializedBridge.canvasEvents.on('vmUpdated', (event) => {
      pageEditorApi.vmUpdate(event.vm);
    });

    initializedBridge.canvasEvents.on('screenUpdate', () => {
      const pageViewState = initializedBridge.canvasCommands.getPageViewState();
      pageEditorApi.pageViewStateUpdate(pageViewState);
    });

    initializedBridge.canvasEvents.on('pageNavigationRequest', (event) => {
      appStateApi.setView({ kind: 'page', name: event.pageName });
    });

    setBridge(initializedBridge);
  });

  const runtimeState = useRuntimeState();

  return (
    <RenderPanelRoot className={className}>
      <EditorCanvasHost
        className={classes.view}
        runtimeState={runtimeState}
        base={appState.appUrl}
        savedNodes={savedNodes}
        pageName={page.name}
        overlay={appDom.isCodePage(page) ? null : <RenderOverlay bridge={bridge} />}
        onInit={handleInit}
      />
    </RenderPanelRoot>
  );
}
