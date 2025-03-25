const ami = require('asterisk-manager');
const mysql = require('mysql2/promise'); // Usando a versão Promise

// Configurações
const config = {
  ami: {
    port: 5038,
    host: '10.37.129.2',  // Substitua pelo IP correto
    username: 'admin',
    password: 'password',
    reconnect: true
  },
  mysql: {
    host: 'localhost',
    user: 'regtrack',
    password: 'password',
    database: 'Moonu'
  }
};

// Conexão MySQL
async function setupDB() {
  const db = await mysql.createConnection(config.mysql);
  console.log('✅ Conectado ao MySQL com sucesso!');
  return db;
}

// Conexão AMI
function setupAMI(db) {
  const manager = ami(
    config.ami.port,
    config.ami.host,
    config.ami.username,
    config.ami.password,
    config.ami.reconnect
  );

  manager.on('connect', () => {
    console.log('✅ Conectado ao AMI!');
    manager.action({
      Action: 'Events',
      EventMask: 'on'
    }, (err) => {
      if (err) console.error('Erro ao ativar eventos:', err);
    });
  });

  manager.on('error', (err) => {
    console.error('❌ Erro AMI:', err);
  });

  // Debug: Mostra dados brutos
  manager.on('data', (data) => {
    console.log('📦 Dado bruto:', data.toString().trim());
  });

  // Processa eventos
  manager.on('event', async (event) => {
    console.log('📡 Evento:', JSON.stringify(event, null, 2));
    
    // Filtra eventos PJSIP (ajuste conforme necessário)
    if (event.Event === 'PeerStatus' || event.Event === 'ContactStatus') {
      try {
        await db.execute(
          'INSERT INTO sip_events (event_type, peer, status, event_data) VALUES (?, ?, ?, ?)',
          [event.Event, event.Peer || event.EndpointName, event.PeerStatus || event.ContactStatus, JSON.stringify(event)]
        );
      } catch (err) {
        console.error('Erro ao salvar no MySQL:', err);
      }
    }
  });

  return manager;
}

// Inicialização
(async () => {
  try {
    const db = await setupDB();
    const manager = setupAMI(db);
    
    process.on('SIGINT', async () => {
      console.log('\n🔴 Encerrando...');
      manager.disconnect();
      await db.end();
      process.exit();
    });
  } catch (err) {
    console.error('Erro na inicialização:', err);
    process.exit(1);
  }
})();