const amiConfig = require('./lib/infra/config');
const dbConfig = require('./lib/infra/config');
const AMIService = require('./lib/services/AMIService');
const DatabaseService = require('./lib/services/DatabaseService');
const EventHandlers = require('./lib/utils/eventHandlers');
const logger = require('./lib/infra/logger');

console.log(dbConfig);

class App {
  constructor() {
    this.logger = logger;
    this.databaseService = new DatabaseService(dbConfig, logger); // Passe o logger para o DatabaseService
    this.eventHandlers = null;
    this.amiService = null;
    this.shuttingDown = false; // Flag para controlar o estado de encerramento
  }

  async start() {
    try {
      this.logger.info(`Initializing application...`);
      
      // Inicializa banco de dados
      await this.databaseService.initialize();
      this.logger.info(`Database successfully initialized`);
      
      // Configura handlers de eventos
      this.eventHandlers = new EventHandlers(this.databaseService.getModel(), logger); // Passe o logger
      
      // Inicia serviço AMI
      this.amiService = new AMIService(amiConfig, this.eventHandlers, logger); // Passe o logger
      this.amiService.connect();
      this.logger.info(`AMI Service connected`);
      
      // Configura tratamento de sinais do sistema
      this.setupShutdownHandlers();
      
      this.logger.info(`Application successfully started`);
    } catch (error) {
      this.logger.error(`Failed to load application: ${error.message}`);
      this.logger.debug(`${error.stack}`);
      await this.shutdown(1);
    }
  }

  setupShutdownHandlers() {
    // Evita múltiplas chamadas ao shutdown
    const gracefulShutdown = async () => {
      if (this.shuttingDown) return;
      this.shuttingDown = true;
      await this.shutdown();
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    process.on('uncaughtException', async (err) => {
      this.logger.error(`Uncaught exception: ${err}`);
      await gracefulShutdown();
    });
    process.on('unhandledRejection', async (reason) => {
      this.logger.error(`Unhandled rejection: ${reason}`);
      await gracefulShutdown();
    });
  }

  async shutdown(exitCode = 0) {
    this.logger.info(`Shutting down application...`);
    
    try {
      if (this.amiService) {
        this.logger.debug(`Disconnecting AMI service...`);
        this.amiService.disconnect();
      }
      
      if (this.databaseService) {
        this.logger.debug(`Closing database connections...`);
        await this.databaseService.close();
      }
      
      this.logger.info(`Application shutdown complete`);
      process.exit(exitCode);
    } catch (error) {
      this.logger.error(`Error during shutdown: ${error}`);
      process.exit(1);
    }
  }
}

// Inicia a aplicação
(async () => {
  try {
    const app = new App();
    await app.start();
  } catch (error) {
    this.logger.error(`Fatal error during application startup: ${error}`);
    process.exit(1);
  }
})();