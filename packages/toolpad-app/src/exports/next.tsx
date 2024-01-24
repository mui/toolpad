'use server';

import * as React from 'react';
import * as appDom from '@mui/toolpad-core/appDom';
import ToolpadAppClient from './next-client';
import { initProject } from '../server/localMode';
import createRuntimeState from '../runtime/createRuntimeState';

export interface ToolpadAppServerProps {
  base: string;
  dir: string;
}

let dom = appDom.createDom();
dom = appDom.addNode(
  dom,
  appDom.createNode(dom, 'page', { attributes: {} }),
  appDom.getRoot(dom),
  'pages',
);

export async function ToolpadApp({ base, dir = './toolpad' }: ToolpadAppServerProps) {
  const project = await initProject({
    dev: false,
    dir,
    base,
  });
  //
  // const dom = await project.loadDom();
  const initialState = createRuntimeState({ dom });

  return <ToolpadAppClient basename={base} state={initialState} />;
}
