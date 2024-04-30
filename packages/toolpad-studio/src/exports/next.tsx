'use server';

import * as React from 'react';
import { Emitter } from '@toolpad/utils/events';
import * as appDom from '@toolpad/studio-runtime/appDom';
import { IncomingMessage, ServerResponse } from 'http';
import ToolpadAppClient from './next-client';
import { getOutputFolder, loadDom, resolveProjectDir } from '../server/localMode';
import createRuntimeState from '../runtime/createRuntimeState';
import EnvManager from '../server/EnvManager';
import FunctionsManager from '../server/FunctionsManager';
import DataManager from '../server/DataManager';
import { RuntimeConfig } from '../types';

export interface ToolpadAppServerProps {
  base: string;
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

  // eslint-disable-next-line class-methods-use-this
  async getRuntimeConfig(): Promise<RuntimeConfig> {
    return { externalUrl: '' };
  }
}

interface RequestHandler {
  (req: IncomingMessage, res: ServerResponse): Promise<void>;
}

function createHandler<T>(fn: (project: ToolpadProject) => T): RequestHandler {}

export async function ToolpadApp({ base, dir = './toolpad' }: ToolpadAppServerProps) {
  const project = new ToolpadProject(dir, false);
  const dom = await project.loadDom();
  const initialState = createRuntimeState({ dom });

  return <ToolpadAppClient basename={base} state={initialState} />;
}
