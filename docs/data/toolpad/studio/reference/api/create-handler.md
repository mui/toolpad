# createHandler API

<p class="description">Run Toolpad Studio applications programmatically in a custom server.</p>

## Import

```jsx
import { createHandler } from '@toolpad/studio';
```

## Description

```jsx
const toolpad = await createHandler(config);
```

## Parameters

- `config` the parameters, describing how this handler should behave. See [HandlerConfig](#handlerconfig)

## Returns

A `Promise` for a Toolpad Studio application object exposing a handler which you can attach to a node.js http server. See [Handler](#handler)

## Types

### HandlerConfig

This describes the behavior of the custom handler.

**Properties**

| Name   | Type      | Description                                                                                                                                                              |
| :----- | :-------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base` | `string`  | Base path under which the handler will be hosted.                                                                                                                        |
| `dev`  | `boolean` | Run the handler in dev mode. Only in this mode can the standalone editor be attached.                                                                                    |
| `dir`  | `string`  | The directory under which the Toolpad Studio application definition will be stored. By default will be the `./toolpad` folder relative to the current working directory. |

### Handler

This is the return value from the `createHandler` function.

**Properties**

| Name      | Type                                                  | Description                                                                              |
| :-------- | :---------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| `handler` | `(req: IncomingMessage, res: ServerResponse) => void` | node.js request handler.                                                                 |
| `dispose` | `() => Promise<void>`                                 | Call this method to dispose of the custom handler and release all of its used resources. |

## Usage

:::info
See [custom functions](/toolpad/studio/concepts/custom-server/)
:::
