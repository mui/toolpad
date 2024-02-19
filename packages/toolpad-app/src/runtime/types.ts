import type * as appDom from '@mui/toolpad-core/appDom';

/**
 * Defines all the data needed to render the runtime.
 * While the dom is optimized for storage and editing. It isn't the ideal format used to render the application
 * `RuntimeData` will hold all data to render a toolpad app and will contain things like:
 * - precompile assets, like code component modules
 * - precompiled expressions
 * - datastructures optimized for rendering with less processing required
 * - ...
 */
export interface RuntimeState {
  // We start out with just the rendertree. The ultimate goal will be to move things out of this tree
  dom: appDom.RenderTree;
}
