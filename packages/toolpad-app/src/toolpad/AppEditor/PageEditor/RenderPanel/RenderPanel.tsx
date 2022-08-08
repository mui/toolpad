import * as React from 'react';
import { styled } from '@mui/material';
import { RuntimeEvent, NodeId } from '@mui/toolpad-core';
import { useNavigate } from 'react-router-dom';
import * as appDom from '../../../../appDom';
import EditorCanvasHost, { EditorCanvasHostHandle } from '../EditorCanvasHost';
import { getPageViewState } from '../../../../pageViewState';
import { useDom, useDomApi } from '../../../DomLoader';
import { usePageEditorApi, usePageEditorState } from '../PageEditorProvider';
import RenderOverlay from './RenderOverlay';

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
  const dom = useDom();
  const domApi = useDomApi();
  const api = usePageEditorApi();
  const { appId, nodeId: pageNodeId } = usePageEditorState();

  const canvasHostRef = React.useRef<EditorCanvasHostHandle>(null);

  const handlePageViewStateUpdate = React.useCallback(() => {
    const rootElm = canvasHostRef.current?.getRootElm();

    if (!rootElm) {
      return;
    }

    api.pageViewStateUpdate(getPageViewState(rootElm));
  }, [api]);

  const navigate = useNavigate();

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

          domApi.setNodeNamespacedProp(node, 'props', event.prop, {
            type: 'const',
            value: newValue,
          });
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
        case 'afterRender': {
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
    },
    [dom, domApi, api, navigate],
  );

  return (
    <RenderPanelRoot className={className}>
      <EditorCanvasHost
        ref={canvasHostRef}
        appId={appId}
        className={classes.view}
        dom={dom}
        pageNodeId={pageNodeId}
        onRuntimeEvent={handleRuntimeEvent}
        onScreenUpdate={handlePageViewStateUpdate}
        overlay={<RenderOverlay canvasHostRef={canvasHostRef} />}
      />
    </RenderPanelRoot>
  );
}
