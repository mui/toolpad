import chalk from 'chalk';
import * as appDom from '../appDom';
import { initProject } from './localMode';

// eslint-disable-next-line no-underscore-dangle
(globalThis as any).__project__ ??= initProject().catch((err) => {
  console.error(`${chalk.red('error')} - Failed to intialize Toolpad`);
  console.error(err);
  process.exit(1);
});

export async function getProject(): Promise<ReturnType<typeof initProject>> {
  // eslint-disable-next-line no-underscore-dangle
  return (globalThis as any).__project__;
}

export async function waitForInit(): Promise<void> {
  await getProject();
}

export async function saveDom(newDom: appDom.AppDom): Promise<{ fingerprint: number }> {
  const project = await getProject();
  return project.saveDom(newDom);
}

export async function loadDom(): Promise<appDom.AppDom> {
  const project = await getProject();
  return project.loadDom();
}
