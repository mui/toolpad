'use server';

import { Emitter } from '@toolpad/utils/events';
import * as appDom from '@toolpad/studio-runtime/appDom';
import { IncomingMessage, ServerResponse } from 'http';
import express from 'express';
import { getOutputFolder, loadDom, resolveProjectDir, initProject } from '../server/localMode';
import createRuntimeState from '../runtime/createRuntimeState';
import EnvManager from '../server/EnvManager';
import FunctionsManager from '../server/FunctionsManager';
import DataManager from '../server/DataManager';
import { createRpcServer } from '../server/runtimeRpcServer';
import { createRpcHandler } from '../server/rpc';

export interface ToolpadAppServerProps {
  base: string;
  apiUrl: string;
  dir: string;
}

class ToolpadProject {
  private root: string;

  private dev: boolean;

  public envManager: EnvManager;

  public functionsManager: FunctionsManager;

  public dataManager: DataManager;

  events = new Emitter<any>();

  private dom: Promise<appDom.AppDom> | undefined;

  constructor(root: string, dev: boolean) {
    this.root = resolveProjectDir(root);
    this.dev = dev;
    this.envManager = new EnvManager(this);
    this.functionsManager = new FunctionsManager(this);
    this.dataManager = new DataManager(this);
  }

  get options() {
    return { dev: this.dev };
  }

  getRoot() {
    return this.root;
  }

  getOutputFolder(): string {
    return getOutputFolder(this.root);
  }

  // eslint-disable-next-line class-methods-use-this
  invalidateQueries() {
    // eslint-disable-next-line no-console
    console.log('invalidateQueries stub');
  }

  loadDom() {
    if (!this.dom) {
      this.dom = loadDom(this.root);
    }
    return this.dom;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this, @typescript-eslint/no-empty-function
  async saveDom(dom: appDom.AppDom) {}
}

export interface RequestHandler {
  (req: IncomingMessage, res: ServerResponse): Promise<void>;
}

export interface CreateHandlerParams {
  base: string;
}

export function createApiHandler(
  project: ToolpadProject,
  { base }: CreateHandlerParams,
): RequestHandler {
  const runtimeRpcServer = createRpcServer(project);
  const handler = createRpcHandler(runtimeRpcServer);
  const x = express();
  x.use(base, handler);
  return (req, res) => x(req, res);
}

// TODO: Make this obsolete
function cleanUndefinedProperties(obj: any) {
  if (Array.isArray(obj)) {
    for (let i = obj.length - 1; i >= 0; i -= 1) {
      const item = obj[i];
      if (item === undefined) {
        obj.splice(obj.indexOf(item), 1);
      } else {
        cleanUndefinedProperties(item);
      }
    }
  } else if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (obj[key] === undefined) {
        delete obj[key];
      } else {
        cleanUndefinedProperties(obj[key]);
      }
    }
  }
  return obj;
}

export async function getServerSideProps(project: ToolpadProject) {
  const dom = await project.loadDom();
  const state = createRuntimeState({ dom });
  return cleanUndefinedProperties({ props: { state } });
}

export { initProject };
