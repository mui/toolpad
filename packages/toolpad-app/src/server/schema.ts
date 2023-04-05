import { z } from 'zod';

export const API_VERSION = 'v1';

function toolpadObjectSchema<K extends string, T extends z.ZodType>(kind: K, spec: T) {
  return z.object({
    apiVersion: z.literal(API_VERSION),
    kind: z.literal(kind),
    spec,
  });
}

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]),
);

function nameValuePairSchema<V extends z.ZodTypeAny>(valueType: V) {
  return z.object({ name: z.string(), value: valueType });
}

const jsExpressionBindingSchema = z.object({
  $$jsExpression: z.string(),
});

function bindableSchema<V extends z.ZodTypeAny>(valueType: V) {
  return z.union([jsExpressionBindingSchema, valueType]);
}

const jsExpressionActionSchema = z.object({
  $$jsExpressionAction: z.string(),
});

const navigationActionSchema = z.object({
  $$navigationAction: z.object({
    page: z.string(),
    parameters: z.record(bindableSchema(z.any())),
  }),
});

export type NavigationAction = z.infer<typeof navigationActionSchema>;

const fetchModeSchema = z.union([
  z.literal('query').describe('Fetch automatically when the page opens'),
  z.literal('mutation').describe('Fetch on manual action only'),
]);

const nameStringValuePairSchema = nameValuePairSchema(z.string());

const rawBodySchema = z.object({
  kind: z.literal('raw'),
  content: bindableSchema(z.string()),
  contentType: z.string(),
});

const urlEncodedBodySchema = z.object({
  kind: z.literal('urlEncoded'),
  content: z.array(nameValuePairSchema(bindableSchema(z.string()))),
});

const fetchBodySchema = z.discriminatedUnion('kind', [rawBodySchema, urlEncodedBodySchema]);

export type FetchBody = z.infer<typeof fetchBodySchema>;

const rawResponseTypeSchema = z.object({
  kind: z.literal('raw'),
});

const jsonResponseTypeSchema = z.object({
  kind: z.literal('json'),
});

const csvResponseTypeSchema = z.object({
  kind: z.literal('csv'),
  headers: z.boolean().describe('First row contains headers'),
});

const xmlResponseTypeSchema = z.object({
  kind: z.literal('xml'),
});

const responseTypeSchema = z.discriminatedUnion('kind', [
  rawResponseTypeSchema,
  jsonResponseTypeSchema,
  csvResponseTypeSchema,
  xmlResponseTypeSchema,
]);

export type ResponseType = z.infer<typeof responseTypeSchema>;

const fetchQueryConfigSchema = z.object({
  kind: z.literal('rest'),
  url: bindableSchema(z.string()).optional().describe('The URL of the request'),
  method: z.string().optional().describe('The request method.'),
  headers: z
    .array(nameValuePairSchema(bindableSchema(z.string())))
    .optional()
    .describe('Extra request headers.'),
  searchParams: z
    .array(nameValuePairSchema(bindableSchema(z.string())))
    .optional()
    .describe('Extra url query parameters.'),
  body: fetchBodySchema.optional().describe('The request body.'),
  transformEnabled: z.boolean().optional().describe('Run a custom transformer on the response.'),
  transform: z.string().optional().describe('The custom transformer to run when enabled.'),
  response: responseTypeSchema.optional().describe('How to parse the response.'),
});

export type FetchQueryConfig = z.infer<typeof fetchQueryConfigSchema>;

const localQueryConfigSchema = z.object({
  kind: z.literal('local'),
  function: z.string().optional(),
});

export type LocalQueryConfig = z.infer<typeof localQueryConfigSchema>;

const queryConfigSchema = z.discriminatedUnion('kind', [
  fetchQueryConfigSchema,
  localQueryConfigSchema,
]);

export type QueryConfig = z.infer<typeof queryConfigSchema>;

const querySchema = z.object({
  name: z.string().describe('A name for the query'),
  enabled: bindableSchema(z.boolean()).optional().describe('This query is active'),
  parameters: z
    .array(nameValuePairSchema(bindableSchema(z.any())))
    .optional()
    .describe('Parameters to pass to this query'),
  mode: fetchModeSchema.optional().describe('How to fetch this query'),
  query: queryConfigSchema.optional().describe('Query definition'),
  transform: z.string().optional().describe('Transformation to run on the response'),
  transformEnabled: z.boolean().optional().describe('Enable the transformation'),
  refetchInterval: z.number().optional().describe('Interval to rerun this query at'),
  cacheTime: z.number().optional().describe('Time to cache before refetching'),
});

export type Query = z.infer<typeof querySchema>;

export type Template = {
  $$template: ElementType[];
};

let elementSchema: z.ZodType<ElementType>;

const templateSchema: z.ZodType<Template> = z.object({
  $$template: z.lazy(() => z.array(elementSchema)),
});

const baseElementSchema = z.object({
  component: z.string(),
  name: z.string(),
  layout: z
    .object({
      horizontalAlign: z.string().optional(),
      verticalAlign: z.string().optional(),
      columnSize: z.number().optional(),
    })
    .optional(),
});

type BaseElement = z.infer<typeof baseElementSchema>;

const bindablePropSchema = z.union([
  jsonSchema,
  jsExpressionBindingSchema,
  jsExpressionActionSchema,
  navigationActionSchema,
  templateSchema,
]);

export type BindableProp = z.infer<typeof bindablePropSchema>;

export type ElementType = BaseElement & {
  children?: ElementType[];
  props?: Record<string, BindableProp>;
};

elementSchema = baseElementSchema.extend({
  children: z.lazy(() => z.array(elementSchema).optional()),
  props: z.lazy(() => z.record(bindablePropSchema).optional()),
});

export const pageSchema = toolpadObjectSchema(
  'page',
  z.object({
    id: z.string(),
    title: z.string().optional(),
    parameters: z.array(nameStringValuePairSchema).optional(),
    queries: z.array(querySchema).optional(),
    content: z.array(elementSchema).optional(),
    display: z.union([z.literal('standalone'), z.literal('shell')]).optional(),
  }),
);

export type Page = z.infer<typeof pageSchema>;

export const themeSchema = toolpadObjectSchema(
  'theme',
  z.object({
    'palette.mode': z.union([z.literal('light'), z.literal('dark')]).optional(),
    'palette.primary.main': z.string().optional(),
    'palette.secondary.main': z.string().optional(),
  }),
);

export type Theme = z.infer<typeof themeSchema>;
