const mysql = require('mysql2');
const ami = require('asterisk-manager');

// Configurações do AMI
const amiConfig = {
  host: '10.37.129.3',
  port: 5038, // Porta padrão do AMI
  username: 'admin',
  password: 'password',
  events: 'on' // Habilitar recebimento de eventos
};

// Configurações do MySQL
const mysqlConfig = {
  host: '10.37.129.3',
  user: 'regtrack',
  password: 'password',
  database: 'Moonu'
};

// Criar tabela se não existir (opcional)
async function createTableIfNotExists(connection) {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS ami_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_name VARCHAR(100) NOT NULL,
      event_data JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Tabela verificada/criada com sucesso');
}

// Função para persistir evento no MySQL
async function persistEvent(event) {
  let connection;
  try {
    connection = await mysql.createConnection(mysqlConfig);
    
    // Extrai o nome do evento (removendo espaços e caracteres especiais)
    const eventName = event.event.replace(/\s+/g, '_').toLowerCase();
    console.log(eventName);
    console.log(JSON.stringify(event));
    
    // Insere o evento no banco de dados
    await connection.execute(
      'INSERT INTO ami_events (event_name, event_data) VALUES (?, ?)',
      [eventName, JSON.stringify(event)]
    );
    
    console.log(`Evento ${eventName} persistido com sucesso`);
  } catch (error) {
    console.error('Erro ao persistir evento:', error);
  } finally {
    if (connection) await connection.end();
  }
}

// Iniciar conexão AMI e escutar eventos
async function startAMIClient() {
  try {
    // Conectar ao MySQL e criar tabela se necessário
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    await createTableIfNotExists(mysqlConnection);
    await mysqlConnection.end();

    // Criar conexão AMI
    const amiConnection = ami(amiConfig.port, amiConfig.host, amiConfig.username, amiConfig.password, true);

    // Evento de conexão bem-sucedida
    amiConnection.on('connect', () => {
      console.log('Conectado ao AMI com sucesso');
    });

    // Evento de erro
    amiConnection.on('error', (error) => {
      console.error('Erro na conexão AMI:', error);
    });

    // Escutar todos os eventos
    amiConnection.on('managerevent', (event) => {
      console.log('Evento recebido:', event);
      console.log('JSON:', event.JSON);
      //persistEvent(event);
    });

    // Conectar ao AMI
    amiConnection.connect();

    // Tratar encerramento do processo
    process.on('SIGINT', () => {
      console.log('Encerrando conexões...');
      amiConnection.disconnect();
      process.exit();
    });

  } catch (error) {
    console.error('Erro ao iniciar cliente AMI:', error);
    process.exit(1);
  }
}

// Iniciar o serviço
startAMIClient();