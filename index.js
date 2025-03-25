// Importação dos módulos necessários
const ami = require('asterisk-manager'); // Pacote correto para AMI
const mysql = require('mysql2');         // Cliente MySQL

// ======================================
// CONFIGURAÇÕES
// ======================================
const config = {
  // Configurações do AMI (Asterisk)
  ami: {
    port: 5038,               // Porta padrão do AMI
    host: '10.37.129.3',   // IP do servidor Asterisk
    username: 'admin',        // Usuário AMI (definido no manager.conf)
    password: 'password',     // Senha AMI
    reconnect: true           // Tentar reconectar automaticamente
  },

  // Configurações do MySQL
  mysql: {
    host: 'localhost',
    user: 'regtrack',
    password: 'password',
    database: 'Moonu'
  }
};

// ======================================
// CONEXÃO COM O BANCO DE DADOS
// ======================================
const db = mysql.createConnection(config.mysql);

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err.message);
    process.exit(1); // Encerra o aplicativo em caso de erro
  }
  console.log('✅ Conectado ao MySQL com sucesso!');
});

// ======================================
// CONEXÃO COM O AMI DO ASTERISK
// ======================================
const manager = ami(
  config.ami.port,
  config.ami.host,
  config.ami.username,
  config.ami.password,
  config.ami.reconnect
);

// Evento: Conexão estabelecida
manager.on('connect', () => {
  console.log('✅ Conectado ao AMI do Asterisk!');
  
  // Filtra apenas eventos de registers/unregisters SIP
  manager.action({
    Action: 'Events',
    EventMask: 'on' // Recebe todos os eventos (podemos filtrar depois)
  });
});

// Evento: Erro de conexão
manager.on('error', (err) => {
  console.error('❌ Erro no AMI:', err.message);
});

// ======================================
// TRATAMENTO DE EVENTOS
// ======================================
manager.on('event', (event) => {
  // Filtra apenas eventos de register/unregister
  //if (event.Event === 'PeerStatus') {
    const peer = event.Peer;
    const status = event.PeerStatus;
    
    console.log(`📡 Evento SIP: Peer ${peer} - Status: ${status}`);

    // Persiste no MySQL
    const query = `
      INSERT INTO sip_events 
      (peer, status, event_time) 
      VALUES (?, ?, NOW())
    `;
    
    db.execute(query, [peer, status], (err) => {
      if (err) {
        console.error('Erro ao salvar evento:', err.message);
      }
    });
  //}
});

// ======================================
// TRATAMENTO DE DESLIGAMENTO
// ======================================
process.on('SIGINT', () => {
  console.log('\n🔴 Encerrando aplicação...');
  manager.disconnect();
  db.end();
  process.exit();
});