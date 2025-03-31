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

      await this.connection.execute(`CREATE VIEW view_peerStatus AS
        SELECT 
            a.id,
            a.CompanyId,
            a.Exten,
            a.Status,
            a.Time as StartTime,
            MIN(b.Time) as EndTime,
            TIMESTAMPDIFF(SECOND, a.Time, MIN(b.Time)) as DurationSeconds,
            SEC_TO_TIME(TIMESTAMPDIFF(SECOND, a.Time, MIN(b.Time))) as FormattedDuration
        FROM 
            ami_events a
        JOIN 
            ami_events b ON a.CompanyId = b.CompanyId 
            AND a.Exten = b.Exten
            AND b.Time > a.Time
            AND b.Status != a.Status
        WHERE 
            a.Status = 'Reachable'
        GROUP BY 
            a.id, a.CompanyId, a.Exten, a.Status, a.Time
        HAVING
            EndTime IS NOT NULL
        ORDER BY 
            a.Time;`
       );
       console.log('View verificada/criada com sucesso');
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