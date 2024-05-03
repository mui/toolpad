import { initProject } from '@toolpad/studio/next';

const PROJECT_REF = 'PROJECT_REF';

export async function getProject() {
  if (!globalThis[PROJECT_REF]) {
    globalThis[PROJECT_REF] = initProject({ dir: './toolpad', dev: false });
  }

  return globalThis[PROJECT_REF];
}
