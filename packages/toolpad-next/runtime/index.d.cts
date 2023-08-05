import * as React from 'react';
import { ButtonProps } from '@mui/material';
import * as z from 'zod';

declare const toolpadFileSchema: z.ZodUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"DataGrid">;
    spec: z.ZodOptional<z.ZodObject<{
        heightMode: z.ZodOptional<z.ZodEnum<["auto", "container", "fixed"]>>;
        height: z.ZodOptional<z.ZodNumber>;
        rows: z.ZodOptional<z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
            kind: z.ZodLiteral<"property">;
        }, "strip", z.ZodTypeAny, {
            kind: "property";
        }, {
            kind: "property";
        }>, z.ZodObject<{
            kind: z.ZodLiteral<"fetch">;
            method: z.ZodOptional<z.ZodEnum<["GET", "POST"]>>;
            url: z.ZodOptional<z.ZodString>;
            selector: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            kind: "fetch";
            method?: "GET" | "POST" | undefined;
            url?: string | undefined;
            selector?: string | undefined;
        }, {
            kind: "fetch";
            method?: "GET" | "POST" | undefined;
            url?: string | undefined;
            selector?: string | undefined;
        }>]>>;
        columns: z.ZodOptional<z.ZodArray<z.ZodObject<{
            field: z.ZodString;
            type: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "date", "datetime"]>>;
            valueSelector: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            field: string;
            type?: "string" | "number" | "boolean" | "date" | "datetime" | undefined;
            valueSelector?: string | undefined;
        }, {
            field: string;
            type?: "string" | "number" | "boolean" | "date" | "datetime" | undefined;
            valueSelector?: string | undefined;
        }>, "many">>;
        rowIdSelector: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        heightMode?: "container" | "auto" | "fixed" | undefined;
        height?: number | undefined;
        rows?: {
            kind: "property";
        } | {
            kind: "fetch";
            method?: "GET" | "POST" | undefined;
            url?: string | undefined;
            selector?: string | undefined;
        } | undefined;
        columns?: {
            field: string;
            type?: "string" | "number" | "boolean" | "date" | "datetime" | undefined;
            valueSelector?: string | undefined;
        }[] | undefined;
        rowIdSelector?: string | undefined;
    }, {
        heightMode?: "container" | "auto" | "fixed" | undefined;
        height?: number | undefined;
        rows?: {
            kind: "property";
        } | {
            kind: "fetch";
            method?: "GET" | "POST" | undefined;
            url?: string | undefined;
            selector?: string | undefined;
        } | undefined;
        columns?: {
            field: string;
            type?: "string" | "number" | "boolean" | "date" | "datetime" | undefined;
            valueSelector?: string | undefined;
        }[] | undefined;
        rowIdSelector?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    kind: "DataGrid";
    spec?: {
        heightMode?: "container" | "auto" | "fixed" | undefined;
        height?: number | undefined;
        rows?: {
            kind: "property";
        } | {
            kind: "fetch";
            method?: "GET" | "POST" | undefined;
            url?: string | undefined;
            selector?: string | undefined;
        } | undefined;
        columns?: {
            field: string;
            type?: "string" | "number" | "boolean" | "date" | "datetime" | undefined;
            valueSelector?: string | undefined;
        }[] | undefined;
        rowIdSelector?: string | undefined;
    } | undefined;
}, {
    kind: "DataGrid";
    spec?: {
        heightMode?: "container" | "auto" | "fixed" | undefined;
        height?: number | undefined;
        rows?: {
            kind: "property";
        } | {
            kind: "fetch";
            method?: "GET" | "POST" | undefined;
            url?: string | undefined;
            selector?: string | undefined;
        } | undefined;
        columns?: {
            field: string;
            type?: "string" | "number" | "boolean" | "date" | "datetime" | undefined;
            valueSelector?: string | undefined;
        }[] | undefined;
        rowIdSelector?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    kind: z.ZodLiteral<"Theme">;
    spec: z.ZodOptional<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>>;
}, "strip", z.ZodTypeAny, {
    kind: "Theme";
    spec?: {} | undefined;
}, {
    kind: "Theme";
    spec?: {} | undefined;
}>]>;
type ToolpadFile = z.infer<typeof toolpadFileSchema>;

interface WithDevtoolParams {
    readonly filePath: string;
    readonly file: ToolpadFile;
    readonly dependencies: readonly [string, () => Promise<unknown>][];
    readonly wsUrl: string;
}

declare function reset(): void;
declare function update(key: string, value: unknown): void;
declare function subscribe(key: string, callback: () => void): () => void;
declare function getSnapshot(key: string): unknown;
interface ProbeContextValue {
    update: (key: string, value: unknown) => void;
    subscribe: (key: string, callback: () => void) => () => void;
    getSnapshot: (key: string) => unknown;
}
interface ProbeProviderProps {
    children?: React.ReactNode;
}
declare function useProbeTarget(key: string, value: unknown): void;
declare function useProbe(key: string): unknown;
declare function useProbes(): ProbeContextValue | null;

type probes_ProbeProviderProps = ProbeProviderProps;
declare const probes_getSnapshot: typeof getSnapshot;
declare const probes_reset: typeof reset;
declare const probes_subscribe: typeof subscribe;
declare const probes_update: typeof update;
declare const probes_useProbe: typeof useProbe;
declare const probes_useProbeTarget: typeof useProbeTarget;
declare const probes_useProbes: typeof useProbes;
declare namespace probes {
  export {
    probes_ProbeProviderProps as ProbeProviderProps,
    probes_getSnapshot as getSnapshot,
    probes_reset as reset,
    probes_subscribe as subscribe,
    probes_update as update,
    probes_useProbe as useProbe,
    probes_useProbeTarget as useProbeTarget,
    probes_useProbes as useProbes,
  };
}

declare function EditButton(props: ButtonProps): React.JSX.Element | null;
declare function withDevtool<P extends object>(Component: React.ComponentType<P>, { filePath, file, wsUrl, dependencies }: WithDevtoolParams): React.ComponentType<P>;

export { EditButton, probes, withDevtool };
