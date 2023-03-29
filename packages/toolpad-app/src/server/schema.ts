import { z } from 'zod';

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

const BindableAction = z.union([JsExpressionAction, NavigationAction]);

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

const BaseElement = z.object({
  component: z.string(),
  name: z.string(),
  props: z.record(z.union([bindable(z.any()), BindableAction])).optional(),
  layout: z
    .object({
      horizontalAlign: z.string().optional(),
      verticalAlign: z.string().optional(),
      columnSize: z.number().optional(),
    })
    .optional(),
});

type BaseElementType = z.infer<typeof BaseElement>;

export type ElementType = BaseElementType & {
  children?: ElementType[];
};

const Element: z.ZodType<ElementType> = BaseElement.extend({
  children: z.lazy(() => z.array(Element).optional()),
});

export const Page = z.object({
  id: z.string(),
  title: z.string().optional(),
  parameters: z.array(NameValuePair).optional(),
  queries: z.array(Query).optional(),
  children: z.array(Element).optional(),
});

export type PageType = z.infer<typeof Page>;
