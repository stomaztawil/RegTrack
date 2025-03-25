// Substitua asterisk-manager por node-ami
const AMI = require('node-asterisk-ami');

// Configurações do AMI
const config = {
  host: '10.37.129.3',
  port: 5038,
  username: 'admin',
  password: 'password',
  reconnect: true
};

// Cria a conexão
const ami = new AMI(config);

// Evento: Conexão estabelecida
ami.on('connect', () => {
  console.log('✅ Conectado ao AMI! Ouvindo todos os eventos...\n');
  
  // Habilita recebimento de eventos
  ami.action({
    Action: 'Events',
    EventMask: 'on'
  });
});

// Evento: Erro de conexão
ami.on('error', (err) => {
  console.error('❌ Erro no AMI:', err.message);
});

// Evento: Dados brutos recebidos (debug)
ami.on('data', (rawData) => {
  console.log('📦 Dado bruto:', rawData.toString().trim());
});

// Evento: Qualquer evento processado
ami.on('event', (event) => {
  console.log('📡 Evento recebido:', event);
});

// Encerramento
process.on('SIGINT', () => {
  console.log('\n🔴 Desconectando...');
  ami.disconnect();
  process.exit();
});

// Inicia a conexão
ami.connect();