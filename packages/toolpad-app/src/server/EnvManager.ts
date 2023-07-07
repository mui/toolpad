import * as path from 'path';
import * as chokidar from 'chokidar';
import * as dotenv from 'dotenv';
import { Emitter } from '@mui/toolpad-utils/events';
import chalk from 'chalk';
import { truncate } from '@mui/toolpad-utils/strings';
import { ProjectEvents, ToolpadProjectOptions } from '../types';
import { Awaitable } from '../utils/types';
import { fileExists } from '../../../toolpad-utils/dist/fs';

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

  private values: Awaitable<Record<string, string>> = {};

  constructor(project: IToolpadProject) {
    this.project = project;

    this.loadEnvFile();

    this.initWatcher();
  }

  private loadEnvFile() {
    const envFilePath = this.getEnvFilePath();
    const { parsed = {} } = dotenv.config({ path: envFilePath, override: true });
    if (Object.keys(parsed).length > 0) {
      this.values = parsed;
      // eslint-disable-next-line no-console
      console.log(
        `${chalk.blue('info')}  - loaded env file "${envFilePath}" with keys ${truncate(
          Object.keys(parsed).join(', '),
          1000,
        )}`,
      );
    }
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
      this.loadEnvFile();

      this.project.events.emit('envChanged', {});
      this.project.invalidateQueries();
    };

    envFileWatcher.on('add', handleChange);
    envFileWatcher.on('unlink', handleChange);
    envFileWatcher.on('change', handleChange);
  }

  async getDeclaredValues(): Promise<Record<string, string>> {
    return this.values;
  }
}
