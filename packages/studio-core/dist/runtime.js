import * as React from 'react';
import ErrorIcon from '@mui/icons-material/Error';
import { RUNTIME_PROP_NODE_ID, RUNTIME_PROP_STUDIO_SLOTS } from './constants.js';
export const StudioNodeContext = React.createContext(null);
function SlotsWrapper({ children }) {
    return React.createElement(React.Fragment, null, children);
}
// We want typescript to enforce these props, even when they're not used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PlaceholderWrapper(props) {
    return (React.createElement("div", { style: {
            display: 'block',
            minHeight: 40,
            minWidth: 200,
        } }));
}
// We will use [RUNTIME_PROP_NODE_ID] while walking the fibers to detect React Elements that
// represent StudioNodes. We use a wrapper to ensure only one element exists in the React tree
// that has [RUNTIME_PROP_NODE_ID] property with this nodeId (We could clone the child and add
// the prop, but the child may be spreading its props to other elements). We also don't want this
// property to end up on DOM nodes.
// IMPORTANT! This node must directly wrap the React Element for the studioNode
function RuntimeNodeWrapper({ children }) {
    return children;
}
export class RuntimeStudioNode extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }
    static getDerivedStateFromError(error) {
        return { error: { message: error.message, stack: error.stack } };
    }
    render() {
        if (this.state.error) {
            return (React.createElement(RuntimeNodeWrapper, { ...{
                    [RUNTIME_PROP_NODE_ID]: this.props.nodeId,
                    nodeError: this.state.error,
                } },
                React.createElement("span", { style: {
                        display: 'inline-flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 8,
                        background: 'red',
                        color: 'white',
                    } },
                    React.createElement(ErrorIcon, { color: "inherit", style: { marginRight: 8 } }),
                    " Error")));
        }
        return (React.createElement(StudioNodeContext.Provider, { value: this.props.nodeId },
            React.createElement(RuntimeNodeWrapper, { ...{ [RUNTIME_PROP_NODE_ID]: this.props.nodeId } }, this.props.children)));
    }
}
export function useDiagnostics(pageState, liveBindings) {
    // Layout effect to make sure it's updated before the DOM is updated (which triggers the editor
    // to update its view state).
    React.useLayoutEffect(() => {
        // eslint-disable-next-line no-underscore-dangle
        window.__STUDIO_RUNTIME_PAGE_STATE__ = pageState;
        // eslint-disable-next-line no-underscore-dangle
        window.__STUDIO_RUNTIME_BINDINGS_STATE__ = liveBindings;
    }, [pageState, liveBindings]);
}
export function useStudioNode() {
    const nodeId = React.useContext(StudioNodeContext);
    return React.useMemo(() => {
        if (!nodeId) {
            return null;
        }
        return {
            setProp: (prop, value) => {
                // eslint-disable-next-line no-underscore-dangle
                window.__STUDIO_RUNTIME_EVENT__?.({
                    type: 'propUpdated',
                    nodeId,
                    prop,
                    value,
                });
            },
        };
    }, [nodeId]);
}
export function Placeholder({ prop, children }) {
    const nodeId = React.useContext(StudioNodeContext);
    if (!nodeId) {
        return React.createElement(React.Fragment, null, children);
    }
    const count = React.Children.count(children);
    return count > 0 ? (React.createElement(React.Fragment, null, children)) : (React.createElement(PlaceholderWrapper, { parentId: nodeId, ...{
            [RUNTIME_PROP_STUDIO_SLOTS]: prop,
            slotType: 'single',
        } }));
}
export function Slots({ prop, children }) {
    const nodeId = React.useContext(StudioNodeContext);
    if (!nodeId) {
        return React.createElement(React.Fragment, null, children);
    }
    const count = React.Children.count(children);
    return count > 0 ? (React.createElement(SlotsWrapper, { parentId: nodeId, ...{
            [RUNTIME_PROP_STUDIO_SLOTS]: prop,
            slotType: 'multiple',
        } }, children)) : (React.createElement(Placeholder, { prop: prop }));
}
export async function importCodeComponent(module) {
    const { default: Component, config } = await module;
    // eslint-disable-next-line no-underscore-dangle
    Component.__config = config;
    return Component;
}
