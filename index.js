const amiConfig = require('./config/ami.config');
const mysqlConfig = require('./config/mysql.config');
const AMIService = require('./services/AMIService');
const DatabaseService = require('./services/DatabaseService');
const EventHandlers = require('./utils/eventHandlers');
const Logger = require('./config/logger');

class App {
  constructor() {
    this.logger = Logger;
    this.databaseService = new DatabaseService(mysqlConfig);
    this.eventHandlers = null;
    this.amiService = null;
  }

  async start() {
    try {
      this.logger.info('Initializing application...');
      // Inicializa banco de dados
      await this.databaseService.initialize();
      this.logger.info('Database successfully initialized');
      
      // Configura handlers de eventos
      this.eventHandlers = new EventHandlers(this.databaseService.getModel());
      
      // Inicia serviço AMI
      this.amiService = new AMIService(amiConfig, this.eventHandlers);
      this.amiService.connect();
      this.logger.info('AMI Service connected');
      
      // Configura tratamento de sinais do sistema
      this.setupShutdownHandlers();
      
      
      this.logger.info('Application successfully loaded');
    } catch (error) {
      this.logger.error(`Fail to load application: ${error.message}`);
      this.logger.debug(error.stack);
      await this.shutdown(1);
    }
  }

  setupShutdownHandlers() {
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  async shutdown(exitCode = 0) {
    this.logger.info(' Closing the application...');
    
    try {
      if (this.amiService) {
        this.amiService.disconnect();
      }
      
      if (this.databaseService) {
        await this.databaseService.close();
      }
      
      process.exit(exitCode);
    } catch (error) {
      this.logger.error('Closing error: ', error);
      process.exit(1);
    }
  }
}

// Inicia a aplicação
const app = new App();
app.start();