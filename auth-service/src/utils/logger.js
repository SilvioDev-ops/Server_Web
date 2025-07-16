import winston from "winston";
import dotenv from "dotenv";
import DailyRotateFile from "winston-daily-rotate-file";

dotenv.config();

const { combine, timestamp, printf, colorize, align } = winston.format;

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  audit: 5,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
  audit: "blue",
};

winston.addColors(colors);

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  align(),
  printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
);

const transports = [
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
  }),
];

if (process.env.NODE_ENV !== "production") {
  transports.push(
    new DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    })
  );
}

const logger = winston.createLogger({
  levels: levels,
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.json(),
  transports: transports,
  exitOnError: false,
});

export default logger;
