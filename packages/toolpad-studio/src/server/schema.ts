import { SimplePaletteColorOptions, ThemeOptions } from '@mui/material';
import { z } from 'zod';

export const API_VERSION = 'v1';

function toolpadObjectSchema<K extends string, T extends z.ZodType>(kind: K, spec: T) {
  return z.object({
    apiVersion: z
      .literal('v1')
      .describe(
        `Defines the version of this object. Used in determining compatibility between Toolpad Studio "${kind}" objects.`,
      ),
    kind: z.literal(kind).describe(`Describes the nature of this Toolpad Studio "${kind}" object.`),
    spec: spec.optional().describe(`Defines the shape of this "${kind}" object`),
  });
}

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

function nameValuePairSchema<V extends z.ZodTypeAny>(valueType: V) {
  return z
    .object({
      name: z.string().describe('The name'),
      value: valueType.describe(valueType.description ?? 'The value'),
    })
    .describe('A name/value pair.');
}

export const jsExpressionBindingSchema = z
  .object({
    $$jsExpression: z.string().describe('The expression to be evaluated.'),
  })
  .describe('A binding that evaluates an expression and returns the result.');

export const envBindingSchema = z
  .object({
    $$env: z.string().describe('The name of an environment variable.'),
  })
  .describe('An environment variable.');

function bindableSchema<V extends z.ZodTypeAny>(valueType: V) {
  return z.union([valueType, jsExpressionBindingSchema, envBindingSchema]);
}

const jsExpressionActionSchema = z
  .object({
    $$jsExpressionAction: z.string().describe('The code to be executed.'),
  })
  .describe('A javascript expression to be executed when this action is triggered.');

const navigationActionSchema = z
  .object({
    $$navigationAction: z.object({
      page: z.string().describe('The page that is being navigated to'),
      parameters: z
        .record(bindableSchema(z.any()))
        .describe('Parameters to pass when navigating to this page'),
    }),
  })
  .describe(
    'A navigation from one page to another, optionally passing parameters to the next page.',
  );

export type NavigationAction = z.infer<typeof navigationActionSchema>;

const fetchModeSchema = z.union([
  z.literal('query').describe('Fetch automatically when the page opens'),
  z.literal('mutation').describe('Fetch on manual action only'),
]);

const nameStringValuePairSchema = nameValuePairSchema(z.string()).describe(
  'a name/value pair with a string value.',
);

const rawBodySchema = z.object({
  kind: z.literal('raw'),
  content: bindableSchema(z.string()),
  contentType: z.string(),
});

const bindableNameStringValueSchema = nameValuePairSchema(bindableSchema(z.string())).describe(
  'A name/value pair where the value is dynamically bindable to strings.',
);

const urlEncodedBodySchema = z.object({
  kind: z.literal('urlEncoded'),
  content: z.array(bindableNameStringValueSchema),
});

const fetchBodySchema = z.discriminatedUnion('kind', [rawBodySchema, urlEncodedBodySchema]);

export type FetchBody = z.infer<typeof fetchBodySchema>;

const rawResponseTypeSchema = z
  .object({
    kind: z.literal('raw'),
  })
  .describe("Don't interpret this body at all.");

const jsonResponseTypeSchema = z
  .object({
    kind: z.literal('json'),
  })
  .describe('Interpret the fetch response as JSON');

const csvResponseTypeSchema = z
  .object({
    kind: z.literal('csv'),
    headers: z.boolean().describe('First row contains headers'),
  })
  .describe('Interpret the fetch response as CSV');

const xmlResponseTypeSchema = z
  .object({
    kind: z.literal('xml'),
  })
  .describe('Interpret the fetch response as XML');

const responseTypeSchema = z
  .discriminatedUnion('kind', [
    rawResponseTypeSchema,
    jsonResponseTypeSchema,
    csvResponseTypeSchema,
    xmlResponseTypeSchema,
  ])
  .describe('Describes how a the fetch response is to be interpreted.');

export type ResponseType = z.infer<typeof responseTypeSchema>;

const fetchQueryConfigSchema = z.object({
  kind: z.literal('rest').describe('Designates this object as a fetch query.'),
  url: bindableSchema(z.string()).optional().describe('The URL of the request'),
  method: z.string().optional().describe('The request method.'),
  headers: z.array(bindableNameStringValueSchema).optional().describe('Extra request headers.'),
  searchParams: z
    .array(bindableNameStringValueSchema)
    .optional()
    .describe('Extra url query parameters.'),
  body: fetchBodySchema.optional().describe('The request body.'),
  transformEnabled: z.boolean().optional().describe('Run a custom transformer on the response.'),
  transform: z.string().optional().describe('The custom transformer to run when enabled.'),
  response: responseTypeSchema.optional().describe('How to parse the response.'),
});

export type FetchQueryConfig = z.infer<typeof fetchQueryConfigSchema>;

const localQueryConfigSchema = z.object({
  kind: z.literal('local').describe('Designates this object as a local function query.'),
  function: z
    .string()
    .optional()
    .describe('The function to be executed on the backend by this query.'),
});

export type LocalQueryConfig = z.infer<typeof localQueryConfigSchema>;

const queryConfigSchema = z.discriminatedUnion('kind', [
  fetchQueryConfigSchema,
  localQueryConfigSchema,
]);

export type QueryConfig = z.infer<typeof queryConfigSchema>;

const querySchema = z.object({
  name: z.string().describe('A name for the query'),
  enabled: bindableSchema(z.boolean())
    .optional()
    .describe(
      "Activates or deactivates the query. When deactivated the data won't be loaded when the page opens.",
    ),
  parameters: z
    .array(nameValuePairSchema(bindableSchema(z.any())))
    .optional()
    .describe('Parameters to pass to this query.'),
  mode: fetchModeSchema.optional().describe('How to fetch this query.'),
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

const templateSchema: z.ZodType<Template> = z
  .object({
    $$template: z
      .lazy(() => z.array(elementSchema))
      .describe('The subtree, that describes the UI to be rendered by the template.'),
  })
  .describe('Describes a fragment of Toolpad Studio elements, to be used as a template.');

const baseElementSchema = z.object({
  component: z.string().describe('The component that this element was based on.'),
  name: z
    .string()
    .describe('a name for this component, which is used to reference it inside bindings.'),
  layout: z
    .object({
      horizontalAlign: z
        .string()
        .optional()
        .describe('Lays out the element along the horizontal axis.'),
      verticalAlign: z
        .string()
        .optional()
        .describe('Lays out the element along the vertical axis.'),
      columnSize: z
        .number()
        .optional()
        .describe('The width this element takes up, expressed in terms of columns on the page.'),
      height: z.number().optional().describe('The height this element takes up, in pixels.'),
    })
    .optional()
    .describe('Layout properties for this element.'),
});

type BaseElement = z.infer<typeof baseElementSchema>;

export const bindablePropSchema: z.ZodType = z.lazy(() =>
  z.union([
    ...literalSchema.options,
    z.array(bindablePropSchema),
    z.record(
      z.string().refine((key) => !key.startsWith('$$')),
      bindablePropSchema,
    ),
    jsExpressionBindingSchema,
    envBindingSchema,
    jsExpressionActionSchema,
    navigationActionSchema,
    templateSchema,
  ]),
);

export type BindableProp = z.infer<typeof bindablePropSchema>;

export type ElementType = BaseElement & {
  children?: ElementType[];
  props?: Record<string, BindableProp>;
};

elementSchema = baseElementSchema
  .extend({
    children: z
      .lazy(() => z.array(elementSchema).optional())
      .describe('The children of this element.'),
    props: z
      .lazy(() => z.record(bindablePropSchema).optional())
      .describe('The properties to configure this instance of the component.'),
  })
  .describe('The instance of a component. Used to build user interfaces in pages.');

export const applicationSchema = toolpadObjectSchema(
  'application',
  z.object({
    plan: z.enum(['free', 'pro']).optional().describe('The plan for this application.'),
    authentication: z
      .object({
        providers: z
          .array(
            z.object({
              provider: z
                .enum(['github', 'google', 'azure-ad', 'credentials'])
                .describe('Unique identifier for this authentication provider.'),
              roles: z
                .array(
                  z.object({
                    source: z
                      .array(z.string())
                      .describe('Authentication provider roles to be mapped from.'),
                    target: z.string().describe('Toolpad Studio role to be mapped to.'),
                  }),
                )
                .optional()
                .describe('Role mapping definition for this authentication provider.'),
            }),
          )
          .optional()
          .describe('Authentication providers to use.'),
        restrictedDomains: z
          .array(z.string())
          .optional()
          .describe('Valid email patterns for the authenticated user.'),
      })
      .optional()
      .describe('Authentication configuration for this application.'),
    authorization: z
      .object({
        roles: z
          .array(
            z.union([
              z.string(),
              z.object({
                name: z.string().describe('The name of the role.'),
                description: z.string().optional().describe('A description of the role.'),
              }),
            ]),
          )
          .optional()
          .describe('Available roles for this application. These can be assigned to users.'),
      })
      .optional()
      .describe('Authorization configuration for this application.'),
  }),
);

export type Application = z.infer<typeof applicationSchema>;

export const pageSchema = toolpadObjectSchema(
  'page',
  z.object({
    displayName: z.string().optional().describe('Page name to display in the UI.'),
    id: z
      .string()
      .optional()
      .describe('Serves as a canonical id of the page. Deprecated: use an alias instead.'),
    alias: z.array(z.string()).optional().describe('Page name aliases.'),
    title: z.string().optional().describe('Title for this page.'),
    parameters: z
      .array(nameStringValuePairSchema)
      .optional()
      .describe('Parameters for the page. These can be set inside of the url query string.'),
    queries: z
      .array(querySchema)
      .optional()
      .describe('Queries that are used by the page. These will load data when the page opens.'),
    content: z
      .array(elementSchema)
      .optional()
      .describe('The content of the page. This defines the UI.'),
    authorization: z
      .object({
        allowAll: z.boolean().optional().describe('Allow all users to access this page.'),
        allowedRoles: z
          .array(z.string())
          .optional()
          .describe('Roles that are allowed to access this page.'),
      })
      .optional()
      .describe('Authorization configuration for this page.'),
    display: z
      .union([
        z
          .literal('standalone')
          .describe('Hide the Toolpad Studio chrome and just display the content of the page'),
        z.literal('shell').describe('Show Toolpad Studio header and navigation.'),
      ])
      .optional()
      .describe(
        'Display mode of the page. This can also be set at runtime with the toolpad-display query parameter',
      ),
    maxWidth: z
      .union([
        z.literal('xs'),
        z.literal('sm'),
        z.literal('md'),
        z.literal('lg'),
        z.literal('xl'),
        z.literal('none'),
      ])
      .optional()
      .describe('Top level element of the page.'),
  }),
);

const simplePaletteColorOptionsSchema: z.ZodType<SimplePaletteColorOptions> = z.object({
  main: z.string(),
  light: z.string().optional(),
  dark: z.string().optional(),
  contrastText: z.string().optional(),
});

const themeOptionsSchema: z.ZodType<ThemeOptions> = z
  .object({
    // TODO: expand to full MUI theme object
    palette: z
      .object({
        mode: z.union([z.literal('light'), z.literal('dark')]).optional(),
        primary: simplePaletteColorOptionsSchema.optional(),
        secondary: simplePaletteColorOptionsSchema.optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type Page = z.infer<typeof pageSchema>;

export const themeSchema = toolpadObjectSchema(
  'theme',
  z.object({
    options: themeOptionsSchema
      .optional()
      .describe("The ThemeOptions object that gets fed into MUI's createTheme function."),
  }),
);

export type Theme = z.infer<typeof themeSchema>;

export const META = {
  schemas: {
    Application: applicationSchema,
    Page: pageSchema,
    Theme: themeSchema,
  },
  definitions: {
    JsExpressionBinding: jsExpressionBindingSchema,
    EnvBinding: envBindingSchema,
    JsExpressionAction: jsExpressionActionSchema,
    NavigationAction: navigationActionSchema,
    BindableProp: bindablePropSchema,
    Element: elementSchema,
    Template: templateSchema,
    NameStringValuePair: nameStringValuePairSchema,
    BindableNameStringValue: bindableNameStringValueSchema,
    SimplePaletteColorOptions: simplePaletteColorOptionsSchema,
  },
};
