const AMIService = require('../../../lib/services/AMIService');
const ami = require('asterisk-manager');

// Mock the asterisk-manager module
jest.mock('asterisk-manager', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn()
  }));
});

describe('AMIService', () => {
  let amiService;
  const mockConfig = {
    AMI_HOST: 'localhost',
    AMI_PORT: 5038,
    AMI_USER: 'admin',
    AMI_PASSWORD: 'secret',
    AMI_ALLOWED_EVENTS: ['PeerStatus', 'Registry']
  };
  const mockEventHandlers = {
    handleEvent: jest.fn()
  };
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    amiService = new AMIService(mockConfig, mockEventHandlers, mockLogger);
  });

  describe('Connection Management', () => {
    test('should initialize AMI connection with correct parameters', () => {
      amiService.connect();
      
      expect(ami).toHaveBeenCalledWith(
        mockConfig.AMI_PORT,
        mockConfig.AMI_HOST,
        mockConfig.AMI_USER,
        mockConfig.AMI_PASSWORD,
        true // SSL
      );
    });

    test('should log successful connection', () => {
      amiService.connect();
      
      // Simulate 'connect' event
      const connectCallback = ami.mock.results[0].value.on.mock.calls
        .find(call => call[0] === 'connect')[1];
      connectCallback();
      
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Conectado ao AMI com sucesso'
      );
    });

    test('should log connection errors', () => {
      amiService.connect();
      
      const errorCallback = ami.mock.results[0].value.on.mock.calls
        .find(call => call[0] === 'error')[1];
      errorCallback(new Error('Connection failed'));
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Erro na conexão AMI: Error: Connection failed'
      );
    });

    test('should disconnect properly', () => {
      amiService.connect();
      amiService.disconnect();
      
      expect(ami.mock.results[0].value.disconnect).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Disconnected');
    });
  });

  describe('Event Handling', () => {
    test('should process allowed events', () => {
      amiService.connect();
      
      const eventCallback = ami.mock.results[0].value.on.mock.calls
        .find(call => call[0] === 'managerevent')[1];
      
      const testEvent = {
        event: 'PeerStatus',
        peer: 'SIP/001.1001',
        peerstatus: 'Reachable'
      };
      
      eventCallback(testEvent);
      
      expect(mockEventHandlers.handleEvent).toHaveBeenCalledWith(testEvent);
    });

    test('should ignore non-allowed events', () => {
      amiService.connect();
      
      const eventCallback = ami.mock.results[0].value.on.mock.calls
        .find(call => call[0] === 'managerevent')[1];
      
      eventCallback({ event: 'InvalidEvent' });
      
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Evento não configurado em config.js, ignorado: InvalidEvent')
      );
      expect(mockEventHandlers.handleEvent).not.toHaveBeenCalled();
    });
  });
});