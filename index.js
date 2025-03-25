// Importa o módulo AMI correto
const ami = require('asterisk-manager');

// Configurações do AMI (ajuste com seus dados!)
const config = {
  port: 5038,              // Porta do AMI
  host: '10.37.129.3',  // IP do servidor Asterisk
  username: 'admin',       // Usuário AMI (criado no manager.conf)
  password: 'password',    // Senha AMI
  reconnect: true,
  events: 'on'          // Reconectar automaticamente se cair
};

// Cria a conexão com o AMI
const manager = ami(
  config.port,
  config.host,
  config.username,
  config.password,
  config.reconnect
);

// Evento: Conexão estabelecida
manager.on('connect', () => {
  console.log('✅ Conectado ao AMI! Ouvindo todos os eventos...\n');

  // Habilita recebimento de eventos (sem filtros)
  manager.action({
    Action: 'Events',
    EventMask: 'on'  // Recebe TUDO
  });
});

// Evento: Erro de conexão
manager.on('error', (err) => {
  console.error('❌ Erro no AMI:', err.message);
});

// Evento: Qualquer evento recebido do Asterisk
manager.on('event', (event) => {
  console.log('📡 Evento recebido:', event);
});

// Encerra gracefulmente com Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🔴 Desconectando...');
  manager.disconnect();
  process.exit();
});