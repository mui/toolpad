import mitt from 'mitt';
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

class StudioBridgeImpl implements StudioBridge {
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
      this.events.emit('click', { tragetNode: clickedNode, x, y });
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
}

export function createStudioBridge(window: Window, studioRoot: HTMLElement): StudioBridge {
  return new StudioBridgeImpl(window.document, window.document.body, studioRoot);
}
