'use server';

import * as React from 'react';
import { Emitter } from '@mui/toolpad-utils/events';
import * as appDom from '@mui/toolpad-core/appDom';
import ToolpadAppClient from './next-client';
import { getOutputFolder, loadDom, resolveProjectDir } from '../server/localMode';
import createRuntimeState from '../runtime/createRuntimeState';
import EnvManager from '../server/EnvManager';
import FunctionsManager from '../server/FunctionsManager';
import DataManager from '../server/DataManager';
import type { ServerDefinition } from '../server/runtimeRpcServer';

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
}

export async function ToolpadApp({ base, dir = './toolpad' }: ToolpadAppServerProps) {
  const project = new ToolpadProject(dir, false);
  const dom = await project.loadDom();
  const initialState = createRuntimeState({ dom });
  const api: ServerDefinition = {};

  return <ToolpadAppClient basename={base} state={initialState} />;
}
