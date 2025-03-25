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

// Debug: Mostra a conexão sendo estabelecida
manager.on('connect', () => {
  console.log('✅ Conectado ao AMI! Enviando comando Events...');
  
  manager.action({
    Action: 'Events',
    EventMask: 'on'
  }, (err) => {
    if (err) {
      console.error('❌ Erro ao enviar comando Events:', err);
    } else {
      console.log('🔔 Comando Events enviado. Aguardando eventos...\n');
    }
  });
});

// Debug: Mostra erros detalhados
manager.on('error', (err) => {
  console.error('❌ ERRO AMI:', err.message);
});

// Debug: Mostra eventos brutos (antes do parser)
manager.on('data', (rawData) => {
  console.log('📦 Dado bruto recebido:', rawData.toString().trim());
});

// Eventos processados
manager.on('event', (event) => {
  console.log('📡 Evento processado:', JSON.stringify(event, null, 2));
});