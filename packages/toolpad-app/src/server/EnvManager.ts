import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import * as chokidar from 'chokidar';
import * as dotenv from 'dotenv';
import { Emitter } from '@mui/toolpad-utils/events';
import { errorFrom } from '@mui/toolpad-utils/errors';
import { truncate } from '@mui/toolpad-utils/strings';
import { ProjectEvents, ToolpadProjectOptions } from '../types';
import { Awaitable } from '../utils/types';

interface IToolpadProject {
  options: ToolpadProjectOptions;
  events: Emitter<ProjectEvents>;
  getRoot(): string;
}

export default class EnvManager {
  private project: IToolpadProject;

  private content: string | undefined;

  private values: Awaitable<Record<string, string>> | undefined;

  constructor(project: IToolpadProject) {
    this.project = project;
    this.initWatcher();
  }

  getEnvFilePath() {
    return path.resolve(this.project.getRoot(), '.env');
  }

  private initWatcher() {
    if (!this.project.options.dev) {
      return;
    }

    const envFileWatcher = chokidar.watch([this.getEnvFilePath()]);
    envFileWatcher.on('all', async () => {
      this.values = await this.loadEnvFile();
      this.project.events.emit('envChanged', {});
    });
  }

  private async parseValues() {
    if (!this.content) {
      return {};
    }
    const parsed = dotenv.parse(this.content) as any;

    const envFilePath = this.getEnvFilePath();
    // eslint-disable-next-line no-console
    console.log(
      `${chalk.blue('info')}  - loaded env file "${envFilePath}" with keys ${truncate(
        Object.keys(parsed).join(', '),
        1000,
      )}`,
    );

    return parsed;
  }

  private async loadEnvFile() {
    const envFilePath = this.getEnvFilePath();

    try {
      const newContent = await fs.readFile(envFilePath, { encoding: 'utf-8' });

      if (newContent !== this.content) {
        this.content = newContent;
        return this.parseValues();
      }

      return this.values;
    } catch (err) {
      if (errorFrom(err).code !== 'ENOENT') {
        throw err;
      }
    }

    return {};
  }

  async getValues() {
    if (!this.values) {
      this.values = this.loadEnvFile();
    }
    return this.values;
  }
}
