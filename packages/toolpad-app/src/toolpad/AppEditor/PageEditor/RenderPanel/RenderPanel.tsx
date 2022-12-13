import * as React from 'react';
import { styled } from '@mui/material';
import { RuntimeEvent, NodeId } from '@mui/toolpad-core';
import invariant from 'invariant';
import * as appDom from '../../../../appDom';
import EditorCanvasHost, { EditorCanvasHostHandle } from '../EditorCanvasHost';
import { getNodeHashes, useDom, useDomApi, useDomLoader } from '../../../DomLoader';
import { usePageEditorApi, usePageEditorState } from '../PageEditorProvider';
import RenderOverlay from './RenderOverlay';
import { NodeHashes } from '../../../../types';

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
  const api = usePageEditorApi();
  const { appId, nodeId: pageNodeId } = usePageEditorState();

  const canvasHostRef = React.useRef<EditorCanvasHostHandle>(null);

  const savedNodes: NodeHashes = React.useMemo(
    () => getNodeHashes(domLoader.savedDom),
    [domLoader.savedDom],
  );

  const handleRuntimeEvent = React.useCallback(
    (event: RuntimeEvent) => {
      switch (event.type) {
        case 'propUpdated': {
          const node = appDom.getNode(dom, event.nodeId as NodeId, 'element');
          const actual = node.props?.[event.prop];
          if (actual && actual.type !== 'const') {
            console.warn(`Can't update a non-const prop "${event.prop}" on node "${node.id}"`);
            return;
          }

          const newValue: unknown =
            typeof event.value === 'function' ? event.value(actual?.value) : event.value;

          const updatedDom = appDom.setNodeNamespacedProp(dom, node, 'props', event.prop, {
            type: 'const',
            value: newValue,
          });
          domApi.update(updatedDom);
          return;
        }
        case 'pageStateUpdated': {
          api.pageStateUpdate(event.pageState);
          return;
        }
        case 'pageBindingsUpdated': {
          api.pageBindingsUpdate(event.bindings);
          return;
        }
        case 'screenUpdate': {
          invariant(canvasHostRef.current, 'canvas ref not attached');
          const pageViewState = canvasHostRef.current?.getPageViewState();
          api.pageViewStateUpdate(pageViewState);
          return;
        }
        case 'pageNavigationRequest': {
          domApi.updateView({ kind: 'page', nodeId: event.pageNodeId });
          return;
        }
        default:
          throw new Error(
            `received unrecognized event "${(event as RuntimeEvent).type}" from editor runtime`,
          );
      }
    },
    [dom, domApi, api],
  );

  return (
    <RenderPanelRoot className={className}>
      <EditorCanvasHost
        ref={canvasHostRef}
        appId={appId}
        className={classes.view}
        dom={dom}
        savedNodes={savedNodes}
        pageNodeId={pageNodeId}
        onRuntimeEvent={handleRuntimeEvent}
        overlay={<RenderOverlay canvasHostRef={canvasHostRef} />}
      />
    </RenderPanelRoot>
  );
}
