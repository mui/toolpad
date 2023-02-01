import * as React from 'react';
import { styled } from '@mui/material';
import { NodeId } from '@mui/toolpad-core';
import * as appDom from '../../../../appDom';
import EditorCanvasHost from '../EditorCanvasHost';
import {
  getNodeHashes,
  useDom,
  useEditorStateApi,
  useDomLoader,
  useDomApi,
} from '../../../AppState';
import { usePageEditorApi, usePageEditorState } from '../PageEditorProvider';
import RenderOverlay from './RenderOverlay';
import { NodeHashes } from '../../../../types';
import useEvent from '../../../../utils/useEvent';
import { ToolpadBridge } from '../../../../canvas/ToolpadBridge';

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
  const domLoader = useDomLoader();
  const { dom } = useDom();
  const domApi = useDomApi();
  const editorStateApi = useEditorStateApi();
  const pageEditorApi = usePageEditorApi();
  const { appId, nodeId: pageNodeId } = usePageEditorState();

  const [bridge, setBridge] = React.useState<ToolpadBridge | null>(null);

  const savedNodes: NodeHashes = React.useMemo(
    () => getNodeHashes(domLoader.savedDom),
    [domLoader.savedDom],
  );

  const handleInit = useEvent((initializedBridge: ToolpadBridge) => {
    initializedBridge.canvasEvents.on('propUpdated', (event) => {
      const node = appDom.getNode(dom, event.nodeId as NodeId, 'element');
      const actual = node.props?.[event.prop];
      if (actual && actual.type !== 'const') {
        console.warn(`Can't update a non-const prop "${event.prop}" on node "${node.id}"`);
        return;
      }

      const newValue: unknown =
        typeof event.value === 'function' ? event.value(actual?.value) : event.value;

      domApi.update((draft) =>
        appDom.setNodeNamespacedProp(draft, node, 'props', event.prop, {
          type: 'const',
          value: newValue,
        }),
      );
    });

    initializedBridge.canvasEvents.on('pageStateUpdated', (event) => {
      pageEditorApi.pageStateUpdate(event.pageState, event.globalScopeMeta);
    });

    initializedBridge.canvasEvents.on('pageBindingsUpdated', (event) => {
      pageEditorApi.pageBindingsUpdate(event.bindings);
    });

    initializedBridge.canvasEvents.on('screenUpdate', () => {
      const pageViewState = initializedBridge.canvasCommands.getPageViewState();
      pageEditorApi.pageViewStateUpdate(pageViewState);
    });

    initializedBridge.canvasEvents.on('pageNavigationRequest', (event) => {
      editorStateApi.setView({ kind: 'page', nodeId: event.pageNodeId });
    });

    setBridge(initializedBridge);
  });

  return (
    <RenderPanelRoot className={className}>
      <EditorCanvasHost
        appId={appId}
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
