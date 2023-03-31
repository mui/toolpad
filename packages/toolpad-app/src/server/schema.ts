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

const Query = z.object({
  name: z.string().describe('A name for the query'),
  enabled: bindable(z.boolean()).optional(),
  parameters: z.array(nameValuePair(bindable(z.any()))).optional(),
  mode: FetchMode.optional(),
  dataSource: z.string().optional(),
  query: z.any(),
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
  children: z.array(Element).optional(),
});

export type PageType = z.infer<typeof Page>;
