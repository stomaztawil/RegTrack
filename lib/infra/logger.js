const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Configuração dos níveis de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Definição de cores para os logs
winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
});

// Formato base para todos os transports
const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Formato específico para console (com cores)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  baseFormat
);

// Transportes (destinos dos logs)
const transports = [
  // Console transport (com cores)
  new winston.transports.Console({
    format: consoleFormat,
    level: 'debug' // Mostra mais detalhes no console
  }),
  
  // Arquivo de erros
  new DailyRotateFile({
    filename: '/var/log/Regtrack/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error', // Só logs de erro
    format: baseFormat
  }),
  
  // Arquivo geral
  new DailyRotateFile({
    filename: '/var/log/Regtrack/all-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info', // Logs a partir de info
    format: baseFormat
  })
];

// Cria o logger
const logger = winston.createLogger({
  levels, // Usa os níveis customizados
  level: 'info', // Nível global (se não especificado no transport)
  format: baseFormat, // Formato padrão
  transports,
  exitOnError: false // Não encerrar o processo em erros de log
});

// Exporta o logger
module.exports = logger;