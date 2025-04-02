class EventModel {
    constructor(mysqlConfig, logger) {
      this.mysqlConfig = mysqlConfig;
      this.tableName = mysqlConfig.DB_TABLE_NAME;
      this.logger = logger;
    }
  
    async initialize() {
      const mysql = require('mysql2/promise');
      this.connection = await mysql.createConnection({
        host: this.mysqlConfig.DB_HOST,
        user: this.mysqlConfig.DB_USER,
        password: this.mysqlConfig.DB_PASSWORD,
        database: this.mysqlConfig.DB_NAME
      });
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
      this.logger.info(`Table verified/created successfully`);

      await this.connection.execute(`CREATE OR REPLACE VIEW view_peerStatus AS
        WITH ranked_events AS (
        SELECT *,
            LEAD(Status) OVER (PARTITION BY CompanyId, Exten ORDER BY Time) as next_status,
            LEAD(Time) OVER (PARTITION BY CompanyId, Exten ORDER BY Time) as next_time
        FROM ami_events
        )
        SELECT 
            id,
            CompanyId,
            Exten,
            Time as ReachableTime,
            next_time as UnreachableTime,
            TIMESTAMPDIFF(SECOND, Time, next_time) as DurationSeconds,
            SEC_TO_TIME(TIMESTAMPDIFF(SECOND, Time, next_time)) as FormattedDuration
        FROM ranked_events
        WHERE 
            Status = 'Reachable' AND 
            next_status = 'Unreachable'
        ORDER BY 
            CompanyId, 
            Exten, 
            ReachableTime;`
      );
      this.logger.info(`View verificada/criada com sucesso`);
    }
  
    async persistPeerStatus(event) {
      const [prefix, ...rest] = event.peer.split('/');
      const [companyId, exten] = rest[0].split('.');
      
      await this.connection.execute(
        `INSERT INTO ${this.tableName} (CompanyId, Exten, Status, Time) VALUES (?, ?, ?, NOW())`,
        [companyId, exten, event.peerstatus]
      );
      
      this.logger.info(`PeerStatus event successfully persisted`);
    }
  
    async close() {
      if (this.connection) await this.connection.end();
    }
  }
  
  module.exports = EventModel;