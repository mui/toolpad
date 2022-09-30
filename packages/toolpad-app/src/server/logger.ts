import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  silent: !process.env.TOOLPAD_API_LOGS_ENABLED,
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format((info) => {
          info.level = info.level.toUpperCase();
          return info;
        })(),
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.splat(),
        winston.format.printf(({ timestamp, level, message, ...rest }) => {
          let restString = JSON.stringify(rest, undefined, 2);
          restString = restString === '{}' ? '' : restString;

          return `[${timestamp}] ${level} - ${message} ${restString}`;
        }),
      ),
    }),
  );
}

export default logger;
