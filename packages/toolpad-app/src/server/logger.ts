import pino from 'pino';
import config from './config';

const logger = pino({
  enabled: config.apiLogsEnabled,
  level: process.env.LOG_LEVEL || 'info',
  redact: { paths: [] },
});

export default logger;
