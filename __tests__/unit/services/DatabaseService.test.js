const DatabaseService = require('../../../lib/services/DatabaseService');

// 1. Create a manual mock for EventModel
jest.mock('../../../lib/models/EventModel', () => {
  return jest.fn().mockImplementation((config, logger) => ({
    initialize: jest.fn(),
    close: jest.fn(),
    config,
    logger
  }));
});

describe('DatabaseService', () => {
  const mockConfig = { dbHost: 'localhost' };
  const mockLogger = { info: jest.fn() };
  let dbService;

  beforeEach(() => {
    dbService = new DatabaseService(mockConfig, mockLogger);
  });

  test('should initialize EventModel with config and logger', () => {
    const EventModel = require('../../../lib/models/EventModel');
    // Verify constructor call
    expect(EventModel).toHaveBeenCalledWith(mockConfig, mockLogger);
    // Verify instance properties
    expect(dbService.getModel().config).toEqual(mockConfig);
    expect(dbService.getModel().logger).toEqual(mockLogger);
  });

  test('initialize() should call model.initialize()', async () => {
    await dbService.initialize();
    expect(dbService.getModel().initialize).toHaveBeenCalled();
  });
});