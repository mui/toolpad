import mitt from 'mitt';
import ReactDOM from 'react-dom';
import * as React from 'react';
import { getViewState, findNodeAt } from './pageViewState';
import { NodeId, StudioBridge, StudioBridgeEvents, ViewState } from '../src/types';
import PinholeOverlay from './PinholeOverlay';
import { Rectangle } from '../src/utils/geometry';

function throttle<T extends () => void>(fn: T, time: number): T {
  // TODO: implement throttle (will @mui/material implement, or use lodash?)
  return fn;
}

class SelectionOverlay {
  private pinhole: PinholeOverlay;

  private rect: HTMLDivElement;

  public onClick?: (event: MouseEvent) => void;

  constructor(doc: Document, container: HTMLElement) {
    this.pinhole = new PinholeOverlay(doc, container);
    this.pinhole.onClick = (event) => this.onClick?.(event);

    this.rect = doc.createElement('div');
  }

  update() {
    this.pinhole.update();
  }

  setSelection(rect: Rectangle, text: string) {
    this.pinhole.setRect(rect);
  }

  removeSelection() {
    this.pinhole.setRect(null);
  }
}

class EditorRuntime implements StudioBridge {
  private selectionOverlay: SelectionOverlay;

  private viewState: ViewState = {};

  private studioRoot: HTMLElement;

  private mutationObserver = new MutationObserver(() => this.updateThrottled());

  private resizeObserver = new ResizeObserver(() => this.updateThrottled());

  private updateThrottled = throttle(() => this.update(), 100);

  public events = mitt<StudioBridgeEvents>();

  constructor(doc: Document, container: HTMLElement, studioRoot: HTMLElement) {
    this.selectionOverlay = new SelectionOverlay(doc, container);
    this.selectionOverlay.onClick = (event) => this.onOverlayClick(event);

    this.studioRoot = studioRoot;

    this.mutationObserver.observe(this.studioRoot, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    this.resizeObserver.observe(this.studioRoot);

    this.update();
  }

  // findNodeAt(x: number, y: number): NodeId | null {}

  onOverlayClick(event: MouseEvent) {
    const x = event.clientX;
    const y = event.clientY;
    const clickedNode = findNodeAt(this.studioRoot, this.viewState, x, y);
    if (clickedNode) {
      this.events.emit('click', { targetNode: clickedNode, x, y });
    }
  }

  setSelection(nodeId: NodeId | null) {
    if (nodeId) {
      const nodeState = this.viewState[nodeId];
      if (nodeState) {
        this.selectionOverlay.setSelection(nodeState.rect, 'test 123');
      }
    } else {
      this.selectionOverlay.removeSelection();
    }
  }

  update() {
    this.viewState = getViewState(this.studioRoot);
    this.selectionOverlay.update();
    this.events.emit('update', {});
  }

  getViewState() {
    return this.viewState;
  }

  getRootElm() {
    return this.studioRoot;
  }
}

export function createStudioBridge(window: Window, studioRoot: HTMLElement): StudioBridge {
  const editorRuntime = new EditorRuntime(window.document, window.document.body, studioRoot);
  return {
    events: editorRuntime.events,
    getViewState: () => editorRuntime.getViewState(),
    setSelection: (...args) => editorRuntime.setSelection(...args),
    getRootElm: () => editorRuntime.getRootElm(),
  };
}

function renderOverlay() {
  const overlayRoot = window.document.createElement('div');
  overlayRoot.style.position = 'fixed';
  overlayRoot.style.top = '0';
  overlayRoot.style.left = '0';
  overlayRoot.style.right = '0';
  overlayRoot.style.bottom = '0';
  overlayRoot.style.width = '100%';
  overlayRoot.style.height = '100%';
  overlayRoot.style.pointerEvents = 'none';
  document.body.appendChild(overlayRoot);

  console.log('rendering overlat');
  ReactDOM.render(<div>HELLOOO</div>, overlayRoot);
}

renderOverlay();
