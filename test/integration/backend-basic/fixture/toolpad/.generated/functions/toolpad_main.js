var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// toolpad/resources/functions.ts
var functions_exports = {};
__export(functions_exports, {
  echo: () => echo,
  edited: () => edited,
  hello: () => hello,
  manualQueryWithParams: () => manualQueryWithParams,
  throws: () => throws,
  withParams: () => withParams
});
async function hello() {
  return { message: "hello world" };
}
async function throws() {
  throw new Error("BOOM!");
}
async function edited() {
  return "edited hello";
}
var import_server, echo, withParams, manualQueryWithParams;
var init_functions = __esm({
  "toolpad/resources/functions.ts"() {
    "use strict";
    import_server = require("@mui/toolpad/server");
    echo = (0, import_server.createFunction)(
      async function echo2({ parameters }) {
        return {
          params: parameters,
          secrets: {
            bar: process.env.SECRET_BAR
          }
        };
      },
      {
        parameters: {
          foo: {
            type: "string"
          }
        }
      }
    );
    withParams = (0, import_server.createFunction)(
      async ({ parameters }) => {
        return { parameters };
      },
      {
        parameters: {
          foo: { type: "string" }
          // __NEW_PARAMETER__
        }
      }
    );
    manualQueryWithParams = (0, import_server.createFunction)(
      async ({ parameters }) => {
        return { parameters };
      },
      {
        parameters: {
          foo: { type: "string" }
        }
      }
    );
  }
});

// toolpad:main.ts
var import_toolpad_core = require("@mui/toolpad-core");
var import_errors = require("@mui/toolpad-utils/errors");
var import_node_fetch = __toESM(require("node-fetch"));
if (!global.fetch) {
  global.fetch = import_node_fetch.default;
  global.Headers = import_node_fetch.Headers;
  global.Request = import_node_fetch.Request;
  global.Response = import_node_fetch.Response;
}
var resolversPromise;
async function getResolvers() {
  if (!resolversPromise) {
    resolversPromise = (async () => {
      const functions = await Promise.resolve().then(() => (init_functions(), functions_exports)).catch((err) => {
        console.error(err);
        return {};
      });
      const functionsFileResolvers = Object.entries(functions).flatMap(([name, resolver]) => {
        return typeof resolver === "function" ? [[name, resolver]] : [];
      });
      return new Map(functionsFileResolvers);
    })();
  }
  return resolversPromise;
}
async function loadResolver(name) {
  const resolvers = await getResolvers();
  const resolver = resolvers.get(name);
  if (!resolver) {
    throw new Error(`Can't find "${name}"`);
  }
  return resolver;
}
async function execResolver(name, parameters) {
  const resolver = await loadResolver(name);
  return resolver({ parameters });
}
process.on("message", async (msg) => {
  switch (msg.kind) {
    case "exec": {
      let data, error;
      try {
        data = await execResolver(msg.name, msg.parameters);
      } catch (err) {
        error = (0, import_errors.serializeError)((0, import_errors.errorFrom)(err));
      }
      process.send({
        kind: "result",
        id: msg.id,
        data,
        error
      });
      break;
    }
    case "introspect": {
      let data, error;
      try {
        const resolvers = await getResolvers();
        const resolvedResolvers = Array.from(resolvers, ([name, resolver]) => [
          name,
          resolver[import_toolpad_core.TOOLPAD_FUNCTION] || {}
        ]);
        data = {
          functions: Object.fromEntries(resolvedResolvers.filter(Boolean))
        };
      } catch (err) {
        error = (0, import_errors.serializeError)((0, import_errors.errorFrom)(err));
      }
      process.send({
        kind: "result",
        id: msg.id,
        data,
        error
      });
      break;
    }
    default:
      console.log(`Unknown message kind "${msg.kind}"`);
  }
});
