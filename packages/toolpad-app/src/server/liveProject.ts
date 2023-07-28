import chalk from 'chalk';
import type { ExecFetchResult, NodeId } from '@mui/toolpad-core';
import { initProject } from './localMode';
import type * as appDom from '../appDom';
import type { VersionInfo } from './versionInfo';
import type { Methods } from '../types';

// eslint-disable-next-line no-underscore-dangle
(globalThis as any).__project__ ??= initProject().catch((err) => {
  console.error(`${chalk.red('error')} - Failed to initialize Toolpad`);
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

export async function applyDomDiff(diff: appDom.DomDiff): Promise<{ fingerprint: number }> {
  const project = await getProject();
  return project.applyDomDiff(diff);
}

export async function openCodeEditor(fileName: string, fileType: string): Promise<void> {
  const project = await getProject();
  return project.openCodeEditor(fileName, fileType);
}

export async function getVersionInfo(): Promise<VersionInfo> {
  const project = await getProject();
  return project.getVersionInfo();
}

export async function createComponent(name: string) {
  const project = await getProject();
  return project.createComponent(name);
}

export async function deletePage(name: string) {
  const project = await getProject();
  return project.deletePage(name);
}

export async function execQuery<P, Q>(
  dataNode: appDom.QueryNode<Q>,
  params: Q,
): Promise<ExecFetchResult<any>> {
  const project = await getProject();
  return project.dataManager.execQuery<P, Q>(dataNode, params);
}

export async function dataSourceFetchPrivate<P, Q>(
  dataSourceId: string,
  connectionId: NodeId | null,
  query: Q,
): Promise<any> {
  const project = await getProject();
  return project.dataManager.dataSourceFetchPrivate<P, Q>(dataSourceId, connectionId, query);
}

export async function dataSourceExecPrivate<P, Q, PQS extends Methods>(
  dataSourceId: string,
  method: keyof PQS,
  args: any[],
): Promise<any> {
  const project = await getProject();
  return project.dataManager.dataSourceExecPrivate<P, Q, PQS>(dataSourceId, method, args);
}
