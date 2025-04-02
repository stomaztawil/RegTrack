const AMIService = require('../../../lib/services/AMIService');
const EventModel = require('../../../lib/models/EventModel');

// Mock the EventModel
jest.mock('../../../lib/models/EventModel', () => ({
  create: jest.fn().mockResolvedValue({ id: 1 })
}));

describe('AMIService', () => {
  let amiService;
  const mockConfig = { amiHost: 'localhost' };
  const mockLogger = { info: jest.fn() };

  beforeEach(() => {
    amiService = new AMIService(mockConfig, mockLogger);
    jest.clearAllMocks();
  });

  test('should call EventModel.create when handling event', async () => {
    // If _handleEvent is private, test through public method
    await amiService.handleEvent({ 
      peer: 'SIP/1001', 
      status: 'Reachable' 
    });

    // Or if truly private, you can temporarily expose for testing:
    // await amiService._handleEvent(...);

    expect(EventModel.create).toHaveBeenCalledWith({
      peer: 'SIP/1001',
      event_type: 'Reachable'
    });
  });
});