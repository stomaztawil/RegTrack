const ami = require('asterisk-manager');

class AMIService {
  constructor(config, eventHandlers) {
    this.config = config;
    this.eventHandlers = eventHandlers;
    this.connection = null;
  }

  connect() {
    this.connection = ami(
      this.config.port,
      this.config.host,
      this.config.username,
      this.config.password,
      true
    );

    this.connection.on('connect', () => {
      this.logger.info('Conectado ao AMI com sucesso');
    });

    this.connection.on('error', (error) => {
      this.logger.error('Erro na conexão AMI:', error);
    });

    this.connection.on('managerevent', (event) => {
      if (this.config.allowedEvents.includes(event.event)) {
        this.eventHandlers.handleEvent(event);
      } else {
        this.logger.info('Evento não configurado em ami.config.js, ignorado:', event.event);
      }
    });

    this.connection.connect();
  }

  disconnect() {
    if (this.connection) {
      this.connection.disconnect();
      this.logger.info('')
    }
  }
}

module.exports = AMIService;