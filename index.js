const ami = require('ami-client');

// Configurações do AMI
const config = {
  port: 5038,               // Porta padrão do AMI
  host: '10.37.129.3',   // IP do servidor Asterisk
  username: 'admin',        // Usuário AMI (definido no manager.conf)
  password: 'password',     // Senha AMI
  reconnect: true,           // Tentar reconectar automaticamente
  events: 'on'          // Para receber todos os eventos
};

// Criar conexão AMI
const manager = ami(config.port, config.host, config.username, config.password, true);

// Manipuladores de eventos de conexão
manager.on('connect', () => {
  console.log('Conectado com sucesso ao AMI do Asterisk');
  
  // Habilitar recebimento de eventos
  manager.action({
    'Action': 'Events',
    'EventMask': 'on'
  }, (err, res) => {
    if (err) {
      console.error('Erro ao configurar eventos:', err);
    } else {
      console.log('Recebimento de eventos configurado');
    }
  });
});

manager.on('error', (err) => {
  console.error('Erro na conexão AMI:', err);
});

// Desconectar ao receber SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\nDesconectando do AMI...');
  manager.disconnect();
  process.exit();
});

// Manipulador para todos os eventos AMI
manager.on('managerevent', (event) => {
  console.log('Evento recebido:', JSON.stringify(event, null, 2));
});

// Manipulador para respostas de ações
manager.on('response', (response) => {
  console.log('Resposta recebida:', JSON.stringify(response, null, 2));
});

// Conectar ao AMI
console.log('Conectando ao AMI...');
manager.connect();