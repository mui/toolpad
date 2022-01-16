import { Rectangle } from '../src/utils/geometry';

export default class PinholeOverlay {
  private root: HTMLDivElement;

  private center: HTMLDivElement;

  private left: HTMLDivElement;

  private topLeft: HTMLDivElement;

  private top: HTMLDivElement;

  private topRight: HTMLDivElement;

  private right: HTMLDivElement;

  private bottomRight: HTMLDivElement;

  private bottom: HTMLDivElement;

  private bottomLeft: HTMLDivElement;

  private rect: Rectangle | null;

  public onClick?: (event: MouseEvent) => void;

  constructor(doc: Document, container: HTMLElement) {
    this.root = doc.createElement('div');
    this.root.style.pointerEvents = 'none';
    this.root.style.position = 'fixed';
    this.root.style.top = '0';
    this.root.style.left = '0';
    this.root.style.right = '0';
    this.root.style.bottom = '0';
    this.root.style.width = '100%';
    this.root.style.height = '100%';
    container.appendChild(this.root);

    this.center = this.createSegment(doc, this.root);
    this.left = this.createSegment(doc, this.root);
    this.topLeft = this.createSegment(doc, this.root);
    this.top = this.createSegment(doc, this.root);
    this.topRight = this.createSegment(doc, this.root);
    this.right = this.createSegment(doc, this.root);
    this.bottomRight = this.createSegment(doc, this.root);
    this.bottom = this.createSegment(doc, this.root);
    this.bottomLeft = this.createSegment(doc, this.root);

    this.rect = null;
    this.update();
  }

  // eslint-disable-next-line class-methods-use-this
  private createSegment(doc: Document, container: HTMLElement) {
    const segment = doc.createElement('div');
    container.appendChild(segment);
    segment.style.pointerEvents = 'initial';
    segment.style.position = 'absolute';
    segment.style.left = '0';
    segment.style.top = '0';
    segment.style.right = '0';
    segment.style.bottom = '0';
    segment.style.background = '#000';
    segment.style.opacity = '0.1';
    segment.addEventListener('click', (event) => this.onClick?.(event));
    return segment;
  }

  private updateVisibility(pinhole: boolean) {
    this.center.style.display = pinhole ? 'none' : 'block';

    this.left.style.display = pinhole ? 'block' : 'none';
    this.topLeft.style.display = pinhole ? 'block' : 'none';
    this.top.style.display = pinhole ? 'block' : 'none';
    this.topRight.style.display = pinhole ? 'block' : 'none';
    this.right.style.display = pinhole ? 'block' : 'none';
    this.bottomRight.style.display = pinhole ? 'block' : 'none';
    this.bottom.style.display = pinhole ? 'block' : 'none';
    this.bottomLeft.style.display = pinhole ? 'block' : 'none';
  }

  update() {
    if (this.rect) {
      this.left.style.top = `${this.rect.y}px`;
      this.left.style.width = `${this.rect.x}px`;
      this.left.style.height = `${this.rect.height}px`;

      this.topLeft.style.width = `${this.rect.x}px`;
      this.topLeft.style.height = `${this.rect.y}px`;

      this.top.style.left = `${this.rect.x}px`;
      this.top.style.width = `${this.rect.width}px`;
      this.top.style.height = `${this.rect.y}px`;

      this.topRight.style.left = `${this.rect.x + this.rect.width}px`;
      this.topRight.style.height = `${this.rect.y}px`;

      this.right.style.top = `${this.rect.y}px`;
      this.right.style.left = `${this.rect.x + this.rect.width}px`;
      this.right.style.height = `${this.rect.height}px`;

      this.bottomRight.style.left = `${this.rect.x + this.rect.width}px`;
      this.bottomRight.style.top = `${this.rect.y + this.rect.height}px`;

      this.bottom.style.left = `${this.rect.x}px`;
      this.bottom.style.width = `${this.rect.width}px`;
      this.bottom.style.top = `${this.rect.y + this.rect.height}px`;

      this.bottomLeft.style.width = `${this.rect.x}px`;
      this.bottomLeft.style.top = `${this.rect.y + this.rect.height}px`;
      this.updateVisibility(true);
    } else {
      this.updateVisibility(false);
    }
  }

  setRect(rect: Rectangle | null) {
    this.rect = rect;
    this.update();
  }
}
