const winston = require('winston');
//require('winston-daily-rotate-file');
const DailyRotateFile = require('winston-daily-rotate-file').DailyRotateFile;

// Configuração dos níveis de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Definição de cores para os logs (opcional)
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Formato dos logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Transportes (destinos dos logs)
const transports = [
  // Logs no console
  new winston.transports.Console(),
  // Logs de erro em arquivo rotativo
  new DailyRotateFile({
    filename: '/var/log/Regtrack/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
  }),
  // Todos os logs em arquivo rotativo
  new DailyRotateFile({
    filename: '/var/log/Regtrack/all-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
];

// Cria o logger
const Logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
});

module.exports = Logger;