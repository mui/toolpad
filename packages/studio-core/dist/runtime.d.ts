import * as React from 'react';
import type { LiveBindings, RuntimeEvent, ComponentConfig } from './index';
declare global {
    interface Window {
        __STUDIO_RUNTIME_PAGE_STATE__?: Record<string, unknown>;
        __STUDIO_RUNTIME_BINDINGS_STATE__?: LiveBindings;
        __STUDIO_RUNTIME_EVENT__?: (event: RuntimeEvent) => void;
    }
}
export declare const StudioNodeContext: React.Context<string | null>;
export interface RuntimeError {
    message: string;
    stack?: string;
}
export interface RuntimeStudioNodeProps {
    children: React.ReactElement;
    nodeId: string;
}
interface RuntimeStudioNodeState {
    error: RuntimeError | null;
}
export declare class RuntimeStudioNode extends React.Component<RuntimeStudioNodeProps, RuntimeStudioNodeState> {
    state: RuntimeStudioNodeState;
    constructor(props: RuntimeStudioNodeProps);
    static getDerivedStateFromError(error: Error): RuntimeStudioNodeState;
    render(): JSX.Element;
}
export declare function useDiagnostics(pageState: Record<string, unknown>, liveBindings: LiveBindings): void;
export interface StudioRuntimeNode<P> {
    setProp: <K extends keyof P & string>(key: K, value: React.SetStateAction<P[K]>) => void;
}
export declare function useStudioNode<P = {}>(): StudioRuntimeNode<P> | null;
export interface PlaceholderProps {
    prop: string;
    children?: React.ReactNode;
}
export declare function Placeholder({ prop, children }: PlaceholderProps): JSX.Element;
export interface SlotsProps {
    prop: string;
    children?: React.ReactNode;
}
export declare function Slots({ prop, children }: SlotsProps): JSX.Element;
export declare function importCodeComponent<P>(module: Promise<{
    default: React.FC<P> | React.Component<P>;
    config?: ComponentConfig<P>;
}>): Promise<React.FC<P> | React.Component<P>>;
export {};
