import { IncomingMessage } from 'http';

// Represents what a session is able to do within Toolpad
export interface Capabilities {
  // View and use Toolpad Studio Applications
  view: boolean;
  // Create and edit Toolpad Studio Applications
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getCapabilities(req: IncomingMessage): Promise<Capabilities | null> {
  return CAP_VIEWER;
}
