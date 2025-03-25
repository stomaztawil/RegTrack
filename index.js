const ami = require('asterisk-manager');
const mysql = require('mysql2/promise');

// Configurações
const config = {
  ami: {
    host: '10.37.129.3',
    port: 5038,
    username: 'admin',
    password: 'senha123',
    events: 'on'
  },
  mysql: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Moonu'
  }
};

// Conexão AMI
const amiConnection = ami(
  config.ami.port, 
  config.ami.host, 
  config.ami.username, 
  config.ami.password, 
  true // enable events
);

// Conexão MySQL
let mysqlConnection;

async function setupDatabase() {
  try {
    mysqlConnection = await mysql.createConnection(config.mysql);
    console.log('Conectado ao MySQL com sucesso');
    
    // Criar tabela se não existir
    await mysqlConnection.execute(`
      CREATE TABLE IF NOT EXISTS call_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(50),
        channel VARCHAR(80),
        caller_id VARCHAR(40),
        unique_id VARCHAR(32),
        event_time DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error('Erro na conexão MySQL:', err);
    process.exit(1);
  }
}

// Eventos AMI
amiConnection.on('connect', async () => {
  console.log('Conectado ao AMI do Asterisk');
  
  try {
    // Exemplo de ação AMI
    const response = await new Promise((resolve, reject) => {
      amiConnection.action({
        'Action': 'Ping'
      }, (err, res) => err ? reject(err) : resolve(res));
    });
    
    console.log('Resposta do Ping:', response);
  } catch (err) {
    console.error('Erro no Ping:', err);
  }
});

// Capturar eventos de chamada
amiConnection.on('newchannel', async (event) => {
  console.log('Nova chamada:', event.CallerIDNum);
  
  try {
    await mysqlConnection.execute(
      'INSERT INTO call_events (event_type, channel, caller_id, unique_id) VALUES (?, ?, ?, ?)',
      ['newchannel', event.Channel, event.CallerIDNum, event.Uniqueid]
    );
  } catch (err) {
    console.error('Erro ao registrar chamada:', err);
  }
});

amiConnection.on('hangup', async (event) => {
  console.log('Chamada encerrada:', event.CallerIDNum);
  
  try {
    await mysqlConnection.execute(
      'INSERT INTO call_events (event_type, channel, caller_id, unique_id) VALUES (?, ?, ?, ?)',
      ['hangup', event.Channel, event.CallerIDNum, event.Uniqueid]
    );
  } catch (err) {
    console.error('Erro ao registrar hangup:', err);
  }
});

// Tratamento de erros
amiConnection.on('error', (err) => {
  console.error('Erro na conexão AMI:', err);
});

// Inicialização
(async () => {
  await setupDatabase();
  amiConnection.connect();
})();

// Encerramento limpo
process.on('SIGINT', async () => {
  try {
    await mysqlConnection.end();
    amiConnection.disconnect();
    console.log('Conexões encerradas');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao encerrar:', err);
    process.exit(1);
  }
});