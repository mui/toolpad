import { GlobalScopeNodeState } from './types';

export const RUNTIME_PROP_NODE_ID = '__toolpadNodeId';
export const RUNTIME_PROP_SLOTS = '__toolpadSlots';
export const TOOLPAD_COMPONENT = Symbol.for('ToolpadComponent');
export const TOOLPAD_COMPONENT_MODE_PROPERTY = 'ToolpadComponentMode';

export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];

export const DEFAULT_GLOBAL_SCOPE_NODE_STATE: GlobalScopeNodeState = { item: {} };
