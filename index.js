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

// Escutar todos os eventos dentro do array
const eventosPermitidos = [
  'PeerStatus'
];

// Criar tabela se não existir (opcional)
async function createTableIfNotExists(connection) {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS ami_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      Exten VARCHAR(100) NOT NULL,
      Status VARCHAR(100) NOT NULL,
      Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    const [prefix, ...rest] = peer.split('/');
    const [companyId, exten] = rest[0].split('.');

    console.log(eventName);
    console.log('Peer: ' ,event.peer);
    console.log('CompanyId: ', companyId);
    console.log('Exten: ', exten);
    console.log('Status: ' ,event.peerstatus);
    
    // Insere o evento no banco de dados
    await connection.execute(
      'INSERT INTO ami_events (CompanyId, Exten, Status, Time) VALUES (?, ?, ?, ?)',
      [companyId, exten, event.peerstatus, NOW()]
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

    amiConnection.on('managerevent', (event) => {
      if (eventosPermitidos.includes(event.event)) {
        console.log('Evento recebido:', event);
        persistEvent(event)
      } else {
        console.log('Evento ignorado:', event.event);
      }
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