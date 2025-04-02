const DatabaseService = require('../../../lib/services/DatabaseService');
const EventModel = require('../../../lib/models/EventModel');

// Mock the entire EventModel class
jest.mock('../../../lib/models/EventModel');

describe('DatabaseService', () => {
  let dbService;
  const mockConfig = { dbHost: 'localhost' };
  const mockLogger = { info: jest.fn() };

  beforeEach(() => {
    // Fresh instance for each test
    dbService = new DatabaseService(mockConfig, mockLogger);
    
    // Clear all mock calls between tests
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize EventModel with config and logger', () => {
      expect(EventModel).toHaveBeenCalledWith(mockConfig, mockLogger);
    });

    test('initialize() should call model.initialize()', async () => {
      await dbService.initialize();
      expect(dbService.getModel().initialize).toHaveBeenCalled();
    });
  });

  describe('Shutdown', () => {
    test('close() should call model.close()', async () => {
      await dbService.close();
      expect(dbService.getModel().close).toHaveBeenCalled();
    });
  });

  describe('Model Access', () => {
    test('getModel() should return EventModel instance', () => {
      const model = dbService.getModel();
      expect(model).toBeInstanceOf(EventModel);
      expect(model.initialize).toBeDefined();
    });
  });
});