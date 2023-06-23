import * as path from 'path';
import * as chokidar from 'chokidar';
import * as dotenv from 'dotenv';
import { Emitter } from '@mui/toolpad-utils/events';
import { ProjectEvents, ToolpadProjectOptions } from '../types';
import { Awaitable } from '../utils/types';

interface IToolpadProject {
  options: ToolpadProjectOptions;
  events: Emitter<ProjectEvents>;
  getRoot(): string;
  invalidateQueries(): void;
}

/**
 * Handles loading env files and watches for updates.
 */
export default class EnvManager {
  private project: IToolpadProject;

  private values: Awaitable<Record<string, string>> | undefined;

  constructor(project: IToolpadProject) {
    this.project = project;

    const envFilePath = this.getEnvFilePath();
    const { parsed } = dotenv.config({ path: envFilePath, override: true });
    this.values = parsed;

    this.initWatcher();
  }

  /**
   * Get file path for the env file.
   */
  getEnvFilePath() {
    return path.resolve(this.project.getRoot(), '.env');
  }

  private initWatcher() {
    if (!this.project.options.dev) {
      return;
    }

    const envFileWatcher = chokidar.watch([this.getEnvFilePath()], {
      ignoreInitial: true,
    });

    const handleChange = async () => {
      this.values = undefined;

      const envFilePath = this.getEnvFilePath();
      const { parsed } = dotenv.config({ path: envFilePath, override: true });
      this.values = parsed;

      this.project.events.emit('envChanged', {});
      this.project.invalidateQueries();
    };

    envFileWatcher.on('add', handleChange);
    envFileWatcher.on('unlink', handleChange);
    envFileWatcher.on('change', handleChange);
  }

  async getDeclaredValues(): Promise<Record<string, string>> {
    return this.values ?? {};
  }
}
