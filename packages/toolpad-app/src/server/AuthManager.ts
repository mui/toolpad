import * as appDom from '../appDom';
import { ToolpadProjectOptions } from '../types';

interface IToolpadProject {
  options: ToolpadProjectOptions;
  loadDom(): Promise<appDom.AppDom>;
}

export default class AuthManager {
  private project: IToolpadProject;

  constructor(project: IToolpadProject) {
    this.project = project;
  }

  async getAuthProviders() {
    const dom = await this.project.loadDom();

    const app = appDom.getApp(dom);
    const authorization = app.attributes.authorization;

    return authorization?.provider ?? null;
  }
}
