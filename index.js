// Importando as bibliotecas necessárias
const AMIClient = require('ami-client'); // Para conectar ao AMI do Asterisk
const mysql = require('mysql2'); // Para conectar ao MySQL

// Configurações do AMI
const amiConfig = {
  host: '10.37.129.3', // Endereço IP do servidor Asterisk
  port: 5038, // Porta padrão do AMI
  username: 'admin', // Usuário do AMI
  secret: 'password' // Senha do AMI
};

// Configurações do MySQL
const dbConfig = {
  host: '10.37.129.3', // Endereço IP do servidor MySQL
  user: 'root', // Usuário do MySQL
  password: '', // Senha do MySQL
  database: 'Moonu' // Nome do banco de dados
};

// Criando uma conexão com o MySQL
const connection = mysql.createConnection(dbConfig);

// Conectando ao banco de dados
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err.stack);
    return;
  }
  console.log('Conectado ao MySQL com sucesso!');
});

// Criando uma instância do cliente AMI
const client = new AMIClient(amiConfig);

// Conectando ao AMI
client.connect()
  .then(() => {
    console.log('Conectado ao AMI com sucesso!');

    // Escutando eventos do AMI
    client.on('event', (event) => {
      console.log('Evento recebido:', event);

      // Persistindo o evento no MySQL
      const query = 'INSERT INTO events (event_name, event_data) VALUES (?, ?)';
      const values = [event.Event, JSON.stringify(event)];

      connection.query(query, values, (error, results) => {
        if (error) {
          console.error('Erro ao inserir evento no MySQL:', error.stack);
          return;
        }
        console.log('Evento inserido com sucesso! ID:', results.insertId);
      });
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar ao AMI:', err.stack);
  });

// Lidando com erros de conexão do AMI
client.on('error', (err) => {
  console.error('Erro na conexão AMI:', err.stack);
});

// Lidando com o encerramento da conexão do AMI
client.on('close', () => {
  console.log('Conexão AMI fechada.');
});

// Encerrando a conexão com o MySQL ao fechar a aplicação
process.on('SIGINT', () => {
  connection.end();
  console.log('Conexão com o MySQL encerrada.');
  process.exit();
});