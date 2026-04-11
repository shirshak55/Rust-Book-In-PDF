import process from "node:process";
import pino from "pino";
import pretty from "pino-pretty";

export function createLogger(name: string) {
  return pino(
    {
      name,
      level: process.env.LOG_LEVEL ?? "info",
    },
    pretty({
      colorize: true,
      singleLine: true,
      translateTime: "SYS:HH:MM:ss",
      ignore: "pid,hostname",
    }),
  );
}
