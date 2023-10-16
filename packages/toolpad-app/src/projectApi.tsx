import { useProject } from './project';

export function useProjectApi() {
  const project = useProject();
  return project.api;
}
