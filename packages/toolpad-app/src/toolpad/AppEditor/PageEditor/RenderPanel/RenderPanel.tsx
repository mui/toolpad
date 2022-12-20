import * as React from 'react';
import { styled } from '@mui/material';
import { RuntimeEvent, NodeId } from '@mui/toolpad-core';
import { useNavigate } from 'react-router-dom';
import * as appDom from '../../../../appDom';
import EditorCanvasHost, { EditorCanvasHostHandle } from '../EditorCanvasHost';
import { getNodeHashes, useDom, useDomApi, useDomLoader } from '../../../DomLoader';
import { usePageEditorApi, usePageEditorState } from '../PageEditorProvider';
import RenderOverlay from './RenderOverlay';
import { NodeHashes } from '../../../../types';
import { ToolpadBridge } from '../../../../canvas';
import useEvent from '../../../../utils/useEvent';

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

  const navigate = useNavigate();

  const savedNodes: NodeHashes = React.useMemo(
    () => getNodeHashes(domLoader.savedDom),
    [domLoader.savedDom],
  );

  const handleInit = useEvent((bridge: ToolpadBridge) => {
    bridge.onRuntimeEvent((event: RuntimeEvent) => {
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

          domApi.update((draft) =>
            appDom.setNodeNamespacedProp(draft, node, 'props', event.prop, {
              type: 'const',
              value: newValue,
            }),
          );
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
          const pageViewState = bridge.getPageViewState();
          api.pageViewStateUpdate(pageViewState);
          return;
        }
        case 'pageNavigationRequest': {
          navigate(`../pages/${event.pageNodeId}`);
          return;
        }
        default:
          throw new Error(
            `received unrecognized event "${(event as RuntimeEvent).type}" from editor runtime`,
          );
      }
    });
  });

  return (
    <RenderPanelRoot className={className}>
      <EditorCanvasHost
        appId={appId}
        className={classes.view}
        dom={dom}
        savedNodes={savedNodes}
        pageNodeId={pageNodeId}
        overlay={<RenderOverlay canvasHostRef={canvasHostRef} />}
        onInit={handleInit}
      />
    </RenderPanelRoot>
  );
}
