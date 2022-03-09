import { IncomingMessage } from 'http';

// Represents what a session is able to do within Studio
export interface Capabilities {
  // View and use Studio Applications
  view: boolean;
  // Create and edit Studio Applications
  edit: boolean;
}

export const CAP_VIEWER: Capabilities = {
  view: true,
  edit: false,
};

export const CAP_EDITOR: Capabilities = {
  view: true,
  edit: true,
};

export async function getCapabilities(req: IncomingMessage): Promise<Capabilities | null> {
  // TODO:
  return CAP_EDITOR;
}
