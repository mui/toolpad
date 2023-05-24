import { errorFrom, serializeError } from '@mui/toolpad-utils/errors';
import invariant from 'invariant';
import { TOOLPAD_FUNCTION } from './index';

export interface SetupConfig {
  loadFunctionsFile: () => Promise<unknown>;
}

export type ResolversMap = Map<string, Function>;

type Message =
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

export function setup({ loadFunctionsFile }: SetupConfig) {
  let resolversPromise: Promise<ResolversMap> | undefined;
  async function getResolvers() {
    if (!resolversPromise) {
      resolversPromise = (async () => {
        const functions = await loadFunctionsFile().catch((err) => {
          console.error(err);
          return {};
        });

        invariant(functions && typeof functions === 'object', 'Expected functions to be an object');

        const functionsFileResolvers: [string, Function][] = Object.entries(functions).flatMap(
          ([name, resolver]) => {
            return typeof resolver === 'function' ? [[name, resolver]] : [];
          },
        );

        return new Map(functionsFileResolvers);
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
