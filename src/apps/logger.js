import winston from "winston";

const { combine, timestamp, json, printf } = winston.format;
const timestampFormat = "MMM-DD-YYYY HH:mm:ss";

// logger format
const formatLogger = combine(
  timestamp({ format: timestampFormat }),
  json(),
  printf(({ timestamp, level, message, ...data }) => {
    const response = {
      level,
      timestamp,
      message,
      data,
    };

    return JSON.stringify(response);
  })
);

// logger for API endpoint
const httpLogger = winston.createLogger({
  format: formatLogger,
  transports: [new winston.transports.Console({})],
});

// logger for database query
const dbLogger = winston.createLogger({
  format: formatLogger,
  transports: [new winston.transports.Console({})],
});

export { httpLogger, dbLogger };
