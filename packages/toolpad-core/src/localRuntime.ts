import { errorFrom, serializeError } from '@mui/toolpad-utils/errors';
import invariant from 'invariant';
import { TOOLPAD_FUNCTION } from './index';

export interface SetupConfig {
  functions: Map<string, () => Promise<Record<string, unknown>>>;
}

export type ResolversMap = Map<string, Function>;

export type Message =
  | {
      kind: 'introspect';
      id: number;
    }
  | {
      kind: 'exec';
      id: number;
      name: string;
      parameters: Record<string, any>;
    };

async function loadDefaultExportsAsFunctions(
  functions: Map<string, () => Promise<{ default?: unknown }>>,
): Promise<ResolversMap> {
  const functionsResolvers = new Map<string, Function>();
  await Promise.all(
    Array.from(functions.entries(), async ([name, fn]) => {
      const mod = await fn();
      if (typeof mod.default === 'function') {
        functionsResolvers.set(name, mod.default);
      } else if (name !== 'functions') {
        console.warn(`Function "${name}" is missing a default export`);
      }
    }),
  );

  return functionsResolvers;
}

async function loadResolversFromFunctionsFile(
  functions: Map<string, () => Promise<{ default?: unknown }>>,
): Promise<ResolversMap> {
  const functionsFileLoader = functions.get('functions');
  if (!functionsFileLoader) {
    return new Map();
  }

  const functionsFileModule = await functionsFileLoader().catch((err) => {
    console.error(err);
    return {};
  });

  invariant(
    functionsFileModule && typeof functionsFileModule === 'object',
    'Expected functions to be an object',
  );

  const functionsFileResolvers: [string, Function][] = Object.entries(functionsFileModule).flatMap(
    ([name, resolver]) => {
      return typeof resolver === 'function' ? [[name, resolver]] : [];
    },
  );

  return new Map(functionsFileResolvers);
}

export function setup({ functions }: SetupConfig) {
  let resolversPromise: Promise<ResolversMap> | undefined;
  async function getResolvers() {
    if (!resolversPromise) {
      resolversPromise = (async () => {
        const [functionFileResolvers, resolvers] = await Promise.all([
          loadResolversFromFunctionsFile(functions),
          loadDefaultExportsAsFunctions(functions),
        ]);
        return new Map([...functionFileResolvers, ...resolvers]);
      })();
    }

    return resolversPromise;
  }

  async function loadResolver(name: string) {
    const resolvers = await getResolvers();

    const resolver = resolvers.get(name);

    if (!resolver) {
      throw new Error(`Can't find "${name}"`);
    }

    return resolver;
  }

  async function execResolver(name: string, parameters: any) {
    const resolver = await loadResolver(name);
    return resolver({ parameters });
  }

  process.on('message', async (msg: Message) => {
    switch (msg.kind) {
      case 'exec': {
        let data;
        let error;
        try {
          data = await execResolver(msg.name, msg.parameters);
        } catch (err) {
          error = serializeError(errorFrom(err));
        }
        invariant(process.send, 'The process must be spawned with IPC enabled');
        process.send({
          kind: 'result',
          id: msg.id,
          data,
          error,
        });
        break;
      }
      case 'introspect': {
        let data;
        let error;
        try {
          const resolvers = await getResolvers();
          const resolvedResolvers = Array.from(resolvers, ([name, resolver]) => [
            name,
            (resolver as any)[TOOLPAD_FUNCTION] || {},
          ]);
          data = {
            functions: Object.fromEntries(resolvedResolvers.filter(Boolean)),
          };
        } catch (err) {
          error = serializeError(errorFrom(err));
        }
        invariant(process.send, 'The process must be spawned with IPC enabled');
        process.send({
          kind: 'result',
          id: msg.id,
          data,
          error,
        });
        break;
      }
      default:
        // eslint-disable-next-line no-console
        console.log(`Unknown message kind "${(msg as Message).kind}"`);
    }
  });
}
