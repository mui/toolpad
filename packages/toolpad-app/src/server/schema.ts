import { z } from 'zod';

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]),
);

function nameValuePair<V extends z.ZodTypeAny>(valueType: V) {
  return z.object({ name: z.string(), value: valueType });
}

const JsExpressionBinding = z.object({
  $$jsExpression: z.string(),
});

function bindable<V extends z.ZodTypeAny>(valueType: V) {
  return z.union([JsExpressionBinding, valueType]);
}

const JsExpressionAction = z.object({
  $$jsExpressionAction: z.string(),
});

const NavigationAction = z.object({
  $$navigationAction: z.object({
    page: z.string(),
    parameters: z.record(bindable(z.any())),
  }),
});

export type NavigationActionType = z.infer<typeof NavigationAction>;

const FetchMode = z.union([z.literal('query'), z.literal('mutation')]);

const NameValuePair = nameValuePair(z.string());

const RawBody = z.object({
  kind: z.literal('raw'),
  content: bindable(z.string()),
  contentType: z.string(),
});

const UrlEncodedBody = z.object({
  kind: z.literal('urlEncoded'),
  content: z.array(nameValuePair(bindable(z.string()))),
});

const Body = z.discriminatedUnion('kind', [RawBody, UrlEncodedBody]);

export type BodyType = z.infer<typeof Body>;

const RawResponse = z.object({
  kind: z.literal('raw'),
});

const JsonResponse = z.object({
  kind: z.literal('json'),
});

const CsvResponse = z.object({
  kind: z.literal('csv'),
  headers: z.boolean().describe('First row contains headers'),
});

const XmlResponse = z.object({
  kind: z.literal('xml'),
});

const Response = z.discriminatedUnion('kind', [
  RawResponse,
  JsonResponse,
  CsvResponse,
  XmlResponse,
]);

export type ResponseType = z.infer<typeof Response>;

const FetchQueryConfig = z.object({
  kind: z.literal('rest'),
  url: bindable(z.string()).optional().describe('The URL of the request'),
  method: z.string().optional().describe('The request method.'),
  headers: z
    .array(nameValuePair(bindable(z.string())))
    .optional()
    .describe('Extra request headers.'),
  searchParams: z
    .array(nameValuePair(bindable(z.string())))
    .optional()
    .describe('Extra url query parameters.'),
  body: Body.optional().describe('The request body.'),
  transformEnabled: z.boolean().optional().describe('Run a custom transformer on the response.'),
  transform: z.string().optional().describe('The custom transformer to run when enabled.'),
  response: Response.optional().describe('How to parse the response.'),
});

export type FetchQueryConfigType = z.infer<typeof FetchQueryConfig>;

const LocalQueryConfig = z.object({
  kind: z.literal('local'),
  function: z.string().optional(),
});

export type LocalQueryConfigType = z.infer<typeof LocalQueryConfig>;

const QueryConfig = z.discriminatedUnion('kind', [FetchQueryConfig, LocalQueryConfig]);

export type QueryConfigType = z.infer<typeof QueryConfig>;

const Query = z.object({
  name: z.string().describe('A name for the query'),
  enabled: bindable(z.boolean()).optional(),
  parameters: z.array(nameValuePair(bindable(z.any()))).optional(),
  mode: FetchMode.optional(),
  query: QueryConfig.optional(),
  transform: z.string().optional(),
  transformEnabled: z.boolean().optional(),
  refetchInterval: z.number().optional(),
  cacheTime: z.number().optional(),
});

export type QueryType = z.infer<typeof Query>;

export type TemplateType = {
  $$template: ElementType[];
};

let Element: z.ZodType<ElementType>;

const Template: z.ZodType<TemplateType> = z.object({
  $$template: z.lazy(() => z.array(Element)),
});

const BaseElement = z.object({
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

type BaseElementType = z.infer<typeof BaseElement>;

const BindableProp = z.union([
  jsonSchema,
  JsExpressionBinding,
  JsExpressionAction,
  NavigationAction,
  Template,
]);

export type BindablePropType = z.infer<typeof BindableProp>;

export type ElementType = BaseElementType & {
  children?: ElementType[];
  props?: Record<string, BindablePropType>;
};

Element = BaseElement.extend({
  children: z.lazy(() => z.array(Element).optional()),
  props: z.lazy(() => z.record(BindableProp).optional()),
});

export const Page = z.object({
  id: z.string(),
  title: z.string().optional(),
  parameters: z.array(NameValuePair).optional(),
  queries: z.array(Query).optional(),
  content: z.array(Element).optional(),
  display: z.union([z.literal('standalone'), z.literal('shell')]).optional(),
});

export type PageType = z.infer<typeof Page>;

export const Theme = z.object({
  'palette.mode': z.union([z.literal('light'), z.literal('dark')]).optional(),
  'palette.primary.main': z.string().optional(),
  'palette.secondary.main': z.string().optional(),
});

export type ThemeType = z.infer<typeof Theme>;
