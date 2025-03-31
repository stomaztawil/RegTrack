const EventModel = require('../../models/EventModel');
const mysql = require('mysql2/promise');

// Mock do módulo mysql2
jest.mock('mysql2/promise', () => {
  const mockConnection = {
    execute: jest.fn(),
    end: jest.fn()
  };
  
  return {
    createConnection: jest.fn().mockResolvedValue(mockConnection)
  };
});

describe('EventModel', () => {
  let model;
  const mockConfig = {
    host: 'localhost',
    user: 'test',
    password: 'test',
    database: 'test_db',
    tableName: 'test_events'
  };

  beforeEach(() => {
    model = new EventModel(mockConfig);
    jest.clearAllMocks();
  });

  describe('initialize()', () => {
    it('deve criar uma conexão com o banco de dados', async () => {
      await model.initialize();
      expect(mysql.createConnection).toHaveBeenCalledWith(mockConfig);
    });

    it('deve criar a tabela e view se não existirem', async () => {
      await model.initialize();
      const mockExecute = mysql.createConnection().execute;
      
      expect(mockExecute).toHaveBeenCalledTimes(2);
      expect(mockExecute.mock.calls[0][0]).toContain(`CREATE TABLE IF NOT EXISTS ${mockConfig.tableName}`);
      expect(mockExecute.mock.calls[1][0]).toContain('CREATE OR REPLACE VIEW view_peerStatus');
    });
  });

  describe('persistPeerStatus()', () => {
    beforeEach(async () => {
      await model.initialize();
    });

    it('deve inserir corretamente um evento PeerStatus Reachable', async () => {
      const event = {
        peer: 'PJSIP/1.1001',
        peerstatus: 'Reachable'
      };

      await model.persistPeerStatus(event);

      const mockExecute = mysql.createConnection().execute;
      expect(mockExecute).toHaveBeenCalledWith(
        `INSERT INTO ${mockConfig.tableName} (CompanyId, Exten, Status, Time) VALUES (?, ?, ?, NOW())`,
        ['1', '1001', 'Reachable']
      );
    });

    it('deve inserir corretamente um evento PeerStatus Unreachable', async () => {
      const event = {
        peer: 'PJSIP/2.2002',
        peerstatus: 'Unreachable'
      };

      await model.persistPeerStatus(event);

      const mockExecute = mysql.createConnection().execute;
      expect(mockExecute).toHaveBeenCalledWith(
        `INSERT INTO ${mockConfig.tableName} (CompanyId, Exten, Status, Time) VALUES (?, ?, ?, NOW())`,
        ['2', '2002', 'Unreachable']
      );
    });

    it('deve lidar com formato de peer inválido', async () => {
      const event = {
        peer: 'PJSIP/invalid_format',
        peerstatus: 'Reachable'
      };

      await expect(model.persistPeerStatus(event)).rejects.toThrow();
    });
  });

  describe('close()', () => {
    it('deve fechar a conexão com o banco de dados', async () => {
      await model.initialize();
      await model.close();
      
      const mockEnd = mysql.createConnection().end;
      expect(mockEnd).toHaveBeenCalled();
    });

    it('não deve falhar se não houver conexão', async () => {
      await model.close();
      const mockEnd = mysql.createConnection().end;
      expect(mockEnd).not.toHaveBeenCalled();
    });
  });
});