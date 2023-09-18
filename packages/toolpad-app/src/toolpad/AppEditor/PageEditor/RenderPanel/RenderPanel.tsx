import * as React from 'react';
import { styled } from '@mui/material';
import { NodeId } from '@mui/toolpad-core';
import useEventCallback from '@mui/utils/useEventCallback';
import * as appDom from '../../../../appDom';
import EditorCanvasHost from '../EditorCanvasHost';
import { getNodeHashes, useAppState, useAppStateApi, useDomApi } from '../../../AppState';
import { usePageEditorApi, usePageEditorState } from '../PageEditorProvider';
import RenderOverlay from './RenderOverlay';
import { NodeHashes } from '../../../../types';
import type { ToolpadBridge } from '../../../../canvas/ToolpadBridge';
import { getBindingType } from '../../../../bindings';

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

export interface RenderPanelProps {
  className?: string;
}

export default function RenderPanel({ className }: RenderPanelProps) {
  const domLoader = useAppState();
  const { dom } = useAppState();
  const domApi = useDomApi();
  const appStateApi = useAppStateApi();
  const pageEditorApi = usePageEditorApi();
  const { nodeId: pageNodeId } = usePageEditorState();

  const [bridge, setBridge] = React.useState<ToolpadBridge | null>(null);

  const savedNodes: NodeHashes = React.useMemo(
    () => getNodeHashes(domLoader.savedDom),
    [domLoader.savedDom],
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
      appStateApi.setView({ kind: 'page', nodeId: event.pageNodeId });
    });

    setBridge(initializedBridge);
  });

  return (
    <RenderPanelRoot className={className}>
      <EditorCanvasHost
        className={classes.view}
        dom={dom}
        savedNodes={savedNodes}
        pageNodeId={pageNodeId}
        overlay={<RenderOverlay bridge={bridge} />}
        onInit={handleInit}
      />
    </RenderPanelRoot>
  );
}
