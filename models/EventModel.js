class EventModel {
    constructor(mysqlConfig) {
      this.mysqlConfig = mysqlConfig;
      this.tableName = mysqlConfig.tableName;
    }
  
    async initialize() {
      const mysql = require('mysql2/promise');
      this.connection = await mysql.createConnection(this.mysqlConfig);
      await this.createTableIfNotExists();
    }
  
    async createTableIfNotExists() {
      await this.connection.execute(`
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          CompanyId INT,
          Exten VARCHAR(100) NOT NULL,
          Status VARCHAR(100) NOT NULL,
          Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Tabela verificada/criada com sucesso');
    }
  
    async persistPeerStatus(event) {
      const [prefix, ...rest] = event.peer.split('/');
      const [companyId, exten] = rest[0].split('.');
      
      await this.connection.execute(
        `INSERT INTO ${this.tableName} (CompanyId, Exten, Status, Time) VALUES (?, ?, ?, NOW())`,
        [companyId, exten, event.peerstatus]
      );
      
      console.log('Evento PeerStatus persistido com sucesso');
    }
  
    async close() {
      if (this.connection) await this.connection.end();
    }
  }
  
  module.exports = EventModel;