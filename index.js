const amiConfig = require('./config/ami.config');
const mysqlConfig = require('./config/mysql.config');
const AMIService = require('./services/AMIService');
const DatabaseService = require('./services/DatabaseService');
const EventHandlers = require('./utils/eventHandlers');

class App {
  constructor() {
    this.databaseService = new DatabaseService(mysqlConfig);
    this.eventHandlers = null;
    this.amiService = null;
  }

  async start() {
    try {
      // Inicializa banco de dados
      await this.databaseService.initialize();
      
      // Configura handlers de eventos
      this.eventHandlers = new EventHandlers(this.databaseService.getModel());
      
      // Inicia serviço AMI
      this.amiService = new AMIService(amiConfig, this.eventHandlers);
      this.amiService.connect();
      
      // Configura tratamento de sinais do sistema
      this.setupShutdownHandlers();
      
      console.log('Aplicação iniciada com sucesso');
    } catch (error) {
      console.error('Falha ao iniciar aplicação:', error);
      this.shutdown(1);
    }
  }

  setupShutdownHandlers() {
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  async shutdown(exitCode = 0) {
    console.log('Encerrando aplicação...');
    
    try {
      if (this.amiService) {
        this.amiService.disconnect();
      }
      
      if (this.databaseService) {
        await this.databaseService.close();
      }
      
      process.exit(exitCode);
    } catch (error) {
      console.error('Erro durante encerramento:', error);
      process.exit(1);
    }
  }
}

// Inicia a aplicação
const app = new App();
app.start();