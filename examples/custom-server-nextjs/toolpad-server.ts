import { initProject } from '@toolpad/studio/next';

const PROJECT_REF = 'PROJECT_REF';

export async function getProject() {
  if (!globalThis[PROJECT_REF]) {
    globalThis[PROJECT_REF] = initProject({ dir: './toolpad' });
  }

  return globalThis[PROJECT_REF];
}

export default await getProject();
